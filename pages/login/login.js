// pages/login/login.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    userId: '',
    errorMessage: '',
    rememberMe: true
  },

  handleUserIdInput(e) {
    this.setData({ 
      userId: e.detail.value.trim(),
      errorMessage: ''
    });
  },

  toggleRemember() {
    this.setData({ rememberMe: !this.data.rememberMe });
  },

  async handleLogin() {
    const { userId } = this.data;
    if (!userId) {
      this.setData({ errorMessage: '请输入用户ID' });
      return;
    }

    try {
      wx.showLoading({ title: '登录中...', mask: true });
      const tasks = await api.task.list(userId);
      
      app.globalData.userId = userId;
      wx.setStorageSync('userInfo', { userId });

      if (tasks.length === 0) {
        await api.task.create({
          title: '欢迎使用',
          category: '系统',
          userId: userId,
          status: '未完成'
        });
      }

      wx.hideLoading();
      wx.reLaunch({ url: '/pages/index/index' });
    } catch (err) {
      wx.hideLoading();
      this.setData({ errorMessage: '登录失败，请检查网络' });
    }
  },

  // 隐藏的测试入口
  handleQuickEntry() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});