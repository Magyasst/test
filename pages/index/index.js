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
    shouldAnimate: true
  },

  onShow() {
    if (!app.globalData.userId) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
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
    const stats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === '完成').length,
      overdue: allTasks.filter(t => 
        t.dueDate < this.data.today && t.status !== '完成'
      ).length
    };

    this.setData({ stats }, () => {
      this.filterTasks();
    });
  },

  filterTasks() {
    const { currentTab, searchKeyword, allTasks } = this.data;
    const filtered = allTasks.filter(task => {
      const tabMatch = currentTab === 'all' || 
        (currentTab === 'todo' && task.status !== '完成') ||
        (currentTab === 'done' && task.status === '完成');
      
      const searchMatch = task.title.includes(searchKeyword) || 
        (task.description && task.description.includes(searchKeyword));
      
      return tabMatch && searchMatch;
    });

    this.setData({ filteredTasks: filtered });
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

  handleLogout() {
    app.globalData.userId = '';
    wx.reLaunch({ url: '/pages/login/login' });
  }
});