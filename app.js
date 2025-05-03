// app.js
App({
  globalData: {
    userId: '',
    userInfo: null,
    baseUrl: 'http://localhost:8080/api',
    systemInfo: null
  },

  onLaunch() {
    this.restoreLoginStatus();
  },

  // 恢复登录状态
  restoreLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.userId) {
      this.globalData.userId = userInfo.userId;
      this.globalData.userInfo = userInfo;
    }
  },

  // 统一登录检查
  checkLogin() {
    if (!this.globalData.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  },

  // 安全跳转方法
  safeNavigateTo(url) {
    if (this.checkLogin()) {
      wx.navigateTo({ url });
    }
  }
});