// pages/login/login.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    isLogin: true, // 当前是否为登录状态
    userId: '',
    password: '',
    confirmPassword: '',
    errorMessage: ''
  },

  // 切换到登录
  switchToLogin() {
    this.setData({
      isLogin: true,
      errorMessage: '',
      confirmPassword: ''
    });
  },

  // 切换到注册
  switchToRegister() {
    this.setData({
      isLogin: false,
      errorMessage: '',
      confirmPassword: ''
    });
  },

  // 用户ID输入
  handleUserIdInput(e) {
    this.setData({ 
      userId: e.detail.value.trim(),
      errorMessage: ''
    });
  },

  // 密码输入
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value,
      errorMessage: ''
    });
  },

  // 确认密码输入
  handleConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value,
      errorMessage: ''
    });
  },

  // 登录处理
  async handleLogin() {
    const { userId, password } = this.data;
    
    if (!userId) {
      this.setData({ errorMessage: '请输入用户ID' });
      return;
    }
    
    if (!password) {
      this.setData({ errorMessage: '请输入密码' });
      return;
    }

    try {
      wx.showLoading({ title: '登录中...', mask: true });
      const res = await api.user.login({ userId, password });

      if (res.code === 200) {
        app.globalData.userId = userId;
        wx.setStorageSync('userInfo', { userId });
        wx.reLaunch({ url: '/pages/index/index' });
      } else {
        this.setData({ errorMessage: res.message || '登录失败' });
      }
    } catch (err) {
      this.setData({ errorMessage: '网络异常，请检查连接' });
    } finally {
      wx.hideLoading();
    }
  },

  // 注册处理
  async handleRegister() {
    const { userId, password, confirmPassword } = this.data;
    
    if (!userId) {
      this.setData({ errorMessage: '请输入用户ID' });
      return;
    }
    
    if (!password) {
      this.setData({ errorMessage: '请输入密码' });
      return;
    }

    if (!/^[A-Za-z0-9]{6,18}$/.test(password)) {
      this.setData({ errorMessage: '密码需6-18位字母或数字' });
      return;
    }

    if (password !== confirmPassword) {
      this.setData({ errorMessage: '两次密码输入不一致' });
      return;
    }

    try {
      wx.showLoading({ title: '注册中...', mask: true });
      const res = await api.user.register({ userId, password });

      if (res.code === 200) {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500,
          complete: () => this.switchToLogin()
        });
      } else {
        this.setData({ errorMessage: res.message || '注册失败' });
      }
    } catch (err) {
      this.setData({ errorMessage: '网络异常，请检查连接' });
    } finally {
      wx.hideLoading();
    }
  }
});