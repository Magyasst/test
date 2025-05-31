// utils/api.js 
const app = getApp();

const request = (method, endpoint, data = {}, showLoading = true) => {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }

    const fullUrl = `${app.globalData.baseUrl}${endpoint}`;
    console.log('API Request:', {
      method,
      url: fullUrl,
      data
    });

    wx.request({
      url: fullUrl,
      method: method.toUpperCase(),
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app.globalData.token}`
      },
      data,
      success: (res) => {
        console.log('API Response:', res);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          handleError(res);
          reject(res.data || {
            message: '请求失败'
          });
        }
      },
      fail: (err) => {
        console.error('Request Failed:', err);
        handleError(err);
        reject(err);
      },
      complete: () => {
        if (showLoading) wx.hideLoading();
      }
    });
  });
};

function handleError(error) {
  let message = '网络请求失败';
  const errorData = error.data || {};

  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        message = errorData.message || '请求参数错误';
        break;
      case 401:
        message = '登录已过期';
        app.globalData.userId = '';
        app.globalData.token = '';
        wx.redirectTo({
          url: '/pages/login/login'
        });
        break;
      case 403:
        message = '没有操作权限';
        break;
      case 404:
        message = '资源不存在';
        break;
      case 500:
        message = errorData.message || '服务器内部错误';
        break;
    }
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

const api = {
  task: {
    list: (userId) => request('GET', `/person?userId=${userId}`),
    create: (data) => request('POST', '/person', data),
    createV2: (data) => request('POST', '/person/v2', data),
    update: (id, data) => request('PUT', `/person/${id}`, data),
    delete: (id) => request('DELETE', `/person/${id}`),
    detail: (id) => request('GET', `/person/${id}/safe`, {
      userId: app.globalData.userId
    }),
    search: (params) => request('GET', '/person/search', params),
    updateStatus: (id, status) => request('PUT', `/person/status/${id}`, {
      status
    }),
    
    
    updateV2: (id, data) => request('PUT', `/person/v2/${id}`, data),
  },
  stats: {
    get: (params) => request('GET', '/person/stats', params),
  },
  user: {
    login: (data) => request('POST', '/user/login', data),
    register: (data) => request('POST', '/user/register', data),
    updatePassword: (data) => request('POST', '/user/updatePassword', data)

  },
};

module.exports = api;