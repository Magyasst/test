// pages/profile/profile.js
const app = getApp();
const api = require('../../utils/api');
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    // 用户信息
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
      userId: '未登录'
    },
    
    // 系统信息
    systemInfo: null,
    storageInfo: {},
    notifyEnabled: true,

    // 密码修改相关状态
    showPasswordModal: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    isSubmitting: false
  },

  // 生命周期函数
  onLoad() {
    this.loadUserInfo();
    this.getSystemInfo();
    this.getStorageInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const savedInfo = wx.getStorageSync('userInfo') || this.data.userInfo;
    this.setData({
      userInfo: {
        avatarUrl: savedInfo.avatarUrl || defaultAvatarUrl,
        nickName: savedInfo.nickName || '',
        userId: app.globalData.userId || '未登录'
      }
    });
  },

  // 头像选择
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({ 'userInfo.avatarUrl': avatarUrl });
    this.saveUserInfo();
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({ 'userInfo.nickName': e.detail.value });
    this.saveUserInfo();
  },

  // 保存用户信息
  saveUserInfo() {
    wx.setStorageSync('userInfo', this.data.userInfo);
  },

  // 获取系统信息
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      systemInfo: {
        model: systemInfo.model,
        system: systemInfo.system,
        version: app.globalData.version || '1.0.0'
      }
    });
  },

  // 清除缓存
  clearStorage() {
    wx.showModal({
      title: '确认清除',
      content: '将删除所有本地缓存数据',
      success: res => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.getStorageInfo();
          wx.showToast({ title: '缓存已清除' });
        }
      }
    });
  },

  // 通知开关
  toggleNotification(e) {
    this.setData({ notifyEnabled: e.detail.value });
    wx.showToast({
      title: `通知已${e.detail.value ? '开启' : '关闭'}`,
      icon: 'none'
    });
  },

  // 获取存储信息
  getStorageInfo() {
    const res = wx.getStorageInfoSync();
    this.setData({
      storageInfo: {
        keys: res.keys,
        size: (res.currentSize / 1024).toFixed(2) + 'KB'
      }
    });
  },

  // 页面跳转
  navigateTo(e) {
    const page = e.currentTarget.dataset.page;
    wx.navigateTo({ url: `/pages/${page}/${page}` });
  },

  // 退出登录
  logout() {
    app.globalData.userId = '';
    wx.reLaunch({ url: '/pages/login/login' });
  },

  // 以下是新增的密码修改相关方法 --------------------------
  
  // 显示密码修改弹窗
  showPasswordModal() {
    this.setData({ showPasswordModal: true });
  },

  // 关闭弹窗
  closePasswordModal() {
    this.setData({ 
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  },

  // 输入处理
  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value });
  },
  onNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
  },
  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  // 提交密码修改
  async submitPasswordChange() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    const userId = app.globalData.userId;

    // 前端验证
    if (!oldPassword) {
      wx.showToast({ title: '请输入旧密码', icon: 'none' });
      return;
    }
    if (!/^[A-Za-z0-9]{6,18}$/.test(newPassword)) {
      wx.showToast({ title: '密码需6-18位字母数字', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      const res = await api.user.updatePassword({
        userId,
        oldPassword,
        newPassword
      });

      if (res.code === 200) {
        wx.showToast({ title: '修改成功' });
        this.closePasswordModal();
        // 建议添加退出登录逻辑
        // this.logout(); 
      } else {
        wx.showToast({ title: res.message || '修改失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '网络异常', icon: 'none' });
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});