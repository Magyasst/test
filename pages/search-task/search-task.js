// pages/search-task/search-task.js
const app = getApp();
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    searchParams: { title: '', category: '' },
    categories: ['全部', '工作', '学习', '生活', '其他'],
    categoryIndex: 0,
    searchResult: [],
    loading: false,
    today: formatTime(new Date(), 'YYYY-MM-DD')
  },

  onLoad() {
    if (!app.globalData.userId) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.debounceSearch = this.debounce(this.doSearch, 500);
  },

  handleInput(e) {
    const value = e.detail.value.trim();
    this.setData({ 'searchParams.title': value }, () => {
      this.debounceSearch();
    });
  },

  handleCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      'searchParams.category': index > 0 ? this.data.categories[index] : ''
    }, () => this.doSearch());
  },

  doSearch() {
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const { title, category } = this.data.searchParams;

    this.setData({ loading: true });
    
    // 保持原始参数传递（包括空字符串）
    api.task.search({
      userId,
      title: title,       // 不转换为undefined
      category: category  // 不转换为undefined
    }).then(res => {
      this.setData({ searchResult: this.processResult(res) });
    }).catch(err => {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  processResult(list) {
    return list.map(item => ({
      ...item,
      dueDate: formatTime(item.dueDate, 'YYYY-MM-DD'),
      // 添加逾期状态计算
      isOverdue: item.dueDate < this.data.today && item.status !== '完成'
    }));
  },

  // 保持其他方法不变
  quickToggleStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === '完成' ? '未完成' : '完成';
    
    api.task.updateStatus(id, newStatus).then(() => {
      const updated = this.data.searchResult.map(task => 
        task.id === id ? {...task, status: newStatus} : task
      );
      this.setData({ searchResult: updated });
      wx.showToast({ title: `已标记为${newStatus}`, icon: 'none' });
    }).catch(() => wx.showToast({ title: '操作失败', icon: 'none' }));
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${id}`
    });
  },

  debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
});