// pages/profile/profile.js
const app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
      userId: '未登录'
    },
    systemInfo: null,
    storageInfo: {},
    notifyEnabled: true
  },

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

  // 选择头像
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
    this.saveUserInfo();
  },

  // 输入昵称
  onNicknameInput(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
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

  toggleNotification(e) {
    this.setData({ notifyEnabled: e.detail.value });
    wx.showToast({
      title: `通知已${e.detail.value ? '开启' : '关闭'}`,
      icon: 'none'
    });
  },

  getStorageInfo() {
    const res = wx.getStorageInfoSync();
    this.setData({
      storageInfo: {
        keys: res.keys,
        size: (res.currentSize / 1024).toFixed(2) + 'KB'
      }
    });
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    });
  },

  logout() {
    app.globalData.userId = '';
    wx.reLaunch({ url: '/pages/login/login' });
  }
});