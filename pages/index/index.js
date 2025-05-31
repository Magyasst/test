// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    allTasks: [],
    filteredTasks: [],
    stats: { 
      total: 0, 
      completed: 0, 
      overdue: 0 
    },
    loading: true,
    currentTab: 'all',
    searchKeyword: '',
    today: formatTime(new Date(), 'YYYY-MM-DD'),
    refreshStatus: false,
    shouldAnimate: true,
    greeting: '你好',
    displayName: '用户',
    activeIndex: -1 // 新增激活状态索引
  },

  onShow() {
    if (!app.globalData.userId) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    
    const userInfo = wx.getStorageSync('userInfo') || {};
    const now = new Date();
    const hours = now.getHours();
    
    let greeting = '你好';
    if (hours >= 22 || hours < 5) {
        greeting = '夜深了';
    } else if (hours < 9) {
        greeting = '早上好'; 
    } else if (hours < 12) {
        greeting = '上午好';
    } else if (hours < 14) {
        greeting = '中午好';
    } else if (hours < 18) {
        greeting = '下午好';
    } else {
        greeting = '晚上好';
    }

    const displayName = userInfo.nickName 
      ? `${userInfo.nickName} 🍀` 
      : `用户 ${(app.globalData.userId || '').slice(-4)}`;

    this.setData({
      greeting,
      displayName
    });

    this.loadData();
  },

  async loadData() {
    try {
      const tasks = await api.task.list(app.globalData.userId);
      const userTasks = tasks.filter(t => t.userId === app.globalData.userId);
      
      this.setData({ 
        allTasks: userTasks,
        loading: false
      }, () => {
        this.processTaskData();
        setTimeout(() => {
          this.setData({ shouldAnimate: false });
        }, 500);
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  processTaskData() {
    const { allTasks } = this.data;
    const now = new Date().getTime();
  
    // 为每个任务添加时间戳并计算逾期状态
    const updatedTasks = allTasks.map(task => {
      const dueDate = task.dueDate || '';
      const remindTime = task.remindTime || '23:59:59';
      // 处理没有截止日期的情况（设置为极大值）
      const dueDateTime = dueDate ? 
        new Date(`${dueDate}T${remindTime}`).getTime() : 
        Infinity;
  
      return {
        ...task,
        dueDateTime,  // 添加时间戳属性
        isOverdue: dueDate &&  // 只有有截止日期的才计算逾期
                  !isNaN(dueDateTime) && 
                  dueDateTime < now && 
                  task.status !== '完成'
      };
    });
  
    // 统计计算
    const stats = {
      total: updatedTasks.length,
      completed: updatedTasks.filter(t => t.status === '完成').length,
      overdue: updatedTasks.filter(t => t.isOverdue).length
    };
  
    this.setData({ 
      allTasks: updatedTasks,
      stats 
    }, () => {
      this.filterTasks();
    });
  },

  filterTasks() {
    const { currentTab, searchKeyword, allTasks } = this.data;
    const now = Date.now();
    
    // 第一步：过滤任务
    const filtered = allTasks.filter(task => {
      const tabMatch = 
        currentTab === 'all' || 
        (currentTab === 'todo' && task.status !== '完成') ||
        (currentTab === 'done' && task.status === '完成') ||
        (currentTab === 'overdue' && task.isOverdue);
  
      const searchMatch = 
        task.title.includes(searchKeyword) || 
        (task.description && task.description.includes(searchKeyword));
      
      return tabMatch && searchMatch;
    });
  
    // 第二步：分组排序
    const futureTasks = [];  // 未过期任务
    const pastTasks = [];    // 已过期任务
  
    filtered.forEach(task => {
      if (task.dueDateTime >= now) {
        futureTasks.push(task);
      } else {
        pastTasks.push(task);
      }
    });
  
    // 未过期任务：按截止时间升序（越早越前）
    futureTasks.sort((a, b) => a.dueDateTime - b.dueDateTime);
    
    // 已过期任务：按截止时间降序（越近的越前）
    pastTasks.sort((a, b) => b.dueDateTime - a.dueDateTime);
  
    // 合并结果：未过期在前 + 已过期在后
    const sortedTasks = [...futureTasks, ...pastTasks];
  
    this.setData({ filteredTasks: sortedTasks });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab }, () => {
      this.filterTasks();
    });
  },

  async onPullDownRefresh() {
    this.setData({ 
      refreshStatus: true,
      shouldAnimate: true
    });
    await this.loadData();
    this.setData({ refreshStatus: false });
    wx.stopPullDownRefresh();
  },

  handleSearch(e) {
    this.setData({
      searchKeyword: e.detail.value.trim()
    }, () => {
      this.filterTasks();
    });
  },

  navigateToDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/edit-task/edit-task?id=${taskId}` });
  },

  async quickToggleStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === '完成' ? '未完成' : '完成';
    
    try {
      await api.task.updateStatus(id, newStatus);
      this.updateLocalTaskStatus(id, newStatus);
      wx.showToast({ title: `已标记为${newStatus}`, icon: 'none' });
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  updateLocalTaskStatus(id, newStatus) {
    const updatedTasks = this.data.allTasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    );
    
    this.setData({ allTasks: updatedTasks }, () => {
      this.processTaskData();
    });
  },

  navigateToAdd() {
    wx.navigateTo({ url: '/pages/add-task/add-task' });
  },

  // 新增触摸处理方法
  handleTouchStart(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeIndex: index });
  },

  handleTouchEnd() {
    this.setData({ activeIndex: -1 });
  },

  // 新增长按处理
  handleLongPress(e) {
    const taskId = e.currentTarget.dataset.id;
    const _this = this;
    wx.showModal({
      title: '删除任务',
      content: '确定要删除这个任务吗？',
      success(res) {
        if (res.confirm) {
          _this.deleteTask(taskId);
        }
      }
    });
  },

  async deleteTask(taskId) {
    try {
      await api.task.delete(taskId);
      wx.showToast({ title: '删除成功' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});