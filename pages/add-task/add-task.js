// pages/add-task/add-task.js
const app = getApp();
const api = require('../../utils/api');

const validate = {
  title: (value) => {
    if (!value || value.trim() === '') return '标题不能为空';
    if (value.length > 8) return '标题不能超过8个字';
    return null;
  },
  dueDate: (value) => {
    if (!value) return '请选择截止日期';
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return '不能选择过去的日期';
    return null;
  },
  datetime: (date, time) => {
    if (!date || !time) return null;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const selected = new Date(date);
    selected.setHours(hours, minutes);
    return selected < now ? '提醒时间不能早于当前时间' : null;
  }
};

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
    minDate: new Date().toISOString().split('T')[0],
    maxDate: '2030-12-31'
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value.trim(),
      errorMessage: ''
    });
  },

  selectCategory(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      'form.category': name,
      errorMessage: ''
    });
  },

  handleDateChange(e) {
    const value = e.detail.value;
    const error = validate.dueDate(value);
    
    this.setData({
      'form.dueDate': value,
      errorMessage: error || ''
    }, () => {
      if (this.data.form.remindTime) {
        const timeError = validate.datetime(value, this.data.form.remindTime);
        if (timeError) this.showError(timeError);
      }
    });
  },

  handleTimeChange(e) {
    const value = e.detail.value;
    let error = null;
    
    if (this.data.form.dueDate) {
      error = validate.datetime(this.data.form.dueDate, value);
    }

    this.setData({
      'form.remindTime': value,
      errorMessage: error || ''
    });
  },

  validateForm() {
    const { title, category, dueDate, remindTime } = this.data.form;
    const errors = [
      validate.title(title),
      !category && '请选择任务分类',
      validate.dueDate(dueDate),
      !remindTime && '请选择提醒时间',
      remindTime && validate.datetime(dueDate, remindTime)
    ].filter(Boolean);

    return errors.length > 0 ? errors[0] : null;
  },

  async submitForm() {
    const error = this.validateForm();
    if (error) return this.showError(error);

    try {
      wx.showLoading({ title: '提交中...', mask: true });

      const params = {
        ...this.data.form,
        userId: app.globalData.userId
      };

      const res = await api.task.createV2(params);
      
      if (res.code === 409) {
        return this.showError('已经有相同的任务了！');
      }

      if (res.code !== 200) {
        throw new Error(res.message || '创建任务失败');
      }

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
    } catch (err) {
      const errorMsg = this.mapErrorMsg(err);
      this.showError(errorMsg);
      console.error('提交错误:', err);
    } finally {
      wx.hideLoading();
    }
  },

  mapErrorMsg(error) {
    const msgMap = {
      'Duplicate entry': '已经有相同的任务了！',
      '任务标题重复': '已经有相同的任务了！',
      '该用户下已存在相同标题的任务': '已经有相同的任务了！',
      'Invalid date format': '日期格式错误',
      'Category not found': '无效的任务分类',
      'Network Error': '网络连接失败',
      '请求超时': '服务器响应超时',
      'title': '标题不能为空',
      'dueDate': '请选择有效日期',
      '服务器响应格式异常': '服务器返回数据异常'
    };

    if (error.errMsg && error.errMsg.includes("request:fail")) {
      return error.errMsg.includes("timeout") 
        ? '请求超时' 
        : '网络连接失败';
    }

    if (error.message.includes('Duplicate entry')) {
      return msgMap['Duplicate entry'];
    }

    return msgMap[error.message] || error.message || '未知错误';
  },

  showError(msg) {
    this.setData({ errorMessage: msg });
    wx.vibrateShort({ type: 'medium' });
  }
});