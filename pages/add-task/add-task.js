// pages/add-task/add-task.js
const app = getApp();
const api = require('../../utils/api');
const { validator } = require('../../utils/util'); // 移除不再需要的formatTime

Page({
  data: {
    form: {
      title: '',
      description: '',
      category: '',
      dueDate: '',
      remindTime: '',
      status: '未完成'
    },
    categories: [
      { id: '1', name: '学习' },
      { id: '2', name: '生活' },
      { id: '3', name: '工作' },
      { id: '4', name: '其他' }
    ],
    errorMessage: '',
    minDate: '2020-01-01',
    maxDate: '2030-12-31'
  },

  // 输入处理
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value.trim(),
      errorMessage: ''
    });
  },

  // 分类选择
  selectCategory(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      'form.category': name,
      errorMessage: ''
    });
  },

  // 日期选择
  handleDateChange(e) {
    const value = e.detail.value;
    this.setData({
      'form.dueDate': value,
      errorMessage: ''
    }, () => {
      const error = validator.dueDate(value);
      if (error) this.showError(error);
    });
  },

  // 时间选择
  handleTimeChange(e) {
    this.setData({
      'form.remindTime': e.detail.value,
      errorMessage: ''
    });
  },

  // 表单验证
  validateForm() {
    const { title, category, dueDate } = this.data.form;
    const errors = [
      validator.title(title),
      !category && '请选择任务分类',
      validator.dueDate(dueDate)
    ].filter(Boolean);
    return errors[0] || null;
  },

  // 提交表单
  async submitForm() {
    const error = this.validateForm();
    if (error) return this.showError(error);

    try {
      wx.showLoading({ title: '提交中...', mask: true });
      
      // 构造符合数据库结构的参数
      const params = {
        title: this.data.form.title,
        description: this.data.form.description,
        category: this.data.form.category,
        dueDate: this.data.form.dueDate,
        remindTime: this.data.form.remindTime,
        status: this.data.form.status,
        userId: app.globalData.userId
      };

      console.log('API Request:', params);
      
      // 调用适配后的接口
      const res = await api.task.createV2(params);
      console.log('API Response:', res);

      // 严格判断响应状态
      if (res && res.code === 200) {
        wx.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            setTimeout(() => {
              wx.navigateBack({ delta: 1 });
            }, 1500);
          }
        });
      } else {
        throw new Error(res.message || '服务器响应格式异常');
      }
    } catch (err) {
      this.showError(this.mapErrorMsg(err));
      console.error('提交错误:', err);
    } finally {
      wx.hideLoading(); // 确保关闭加载状态
    }
  },

  // 增强错误处理
  mapErrorMsg(error) {
    const msgMap = {
      'Invalid date format': '日期格式错误',
      'Category not found': '无效的任务分类',
      'title': '标题不能为空',
      'dueDate': '请选择有效日期',
      'Network Error': '网络连接失败',
      '请求超时': '服务器响应超时',
      '服务器响应格式异常': '服务器返回数据异常'
    };

    // 处理微信底层错误
    if (error.errMsg) {
      if (error.errMsg.includes("request:fail")) {
        if (error.errMsg.includes("timeout")) {
          return msgMap['请求超时'];
        }
        return msgMap['Network Error'];
      }
    }

    // 处理HTTP状态码
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400: return '请求参数错误';
        case 401: return '登录已过期';
        case 409: return '任务已存在';
        case 500: return '服务器内部错误';
      }
    }

    return msgMap[error.message] || error.message || '未知错误';
  },

  showError(msg) {
    this.setData({ errorMessage: msg });
    wx.vibrateShort({ type: 'medium' });
  }
});