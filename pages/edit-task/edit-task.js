// pages/edit-task/edit-task.js
const app = getApp();
const api = require('../../utils/api');

const validate = {
  title: (value) => {
    if (!value || value.trim() === '') return '标题不能为空';
    if (value.length > 8) return '标题不能超过8个字';
    return null;
  },
  category: (value) => {
    if (!value) return '请选择任务分类';
    return null;
  },
  dueDate: (value, isChanged) => {
    if (!value) return '请选择截止日期';
    if (isChanged) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) return '不能选择过去的日期';
    }
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
      id: null,
      title: '',
      description: '',
      category: '',
      dueDate: '',
      remindTime: '',
      status: '未完成'
    },
    categories: [
      { name: '学习', icon: '📚', color: '#3B82F6' },
      { name: '生活', icon: '🏡', color: '#10B981' },
      { name: '工作', icon: '💼', color: '#8B5CF6' },
      { name: '其他', icon: '✨', color: '#EF4444' }
    ],
    originalData: {},
    isDataChanged: false,
    showDeleteConfirm: false,
    loading: true,
    errorMessage: '',
    minDate: new Date().toISOString().split('T')[0],
    maxDate: '2030-12-31'
  },

  onLoad(options) {
    if (!app.checkLogin()) return;

    if (!options.id) {
      wx.showToast({ title: '无效的任务ID', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.taskId = options.id;
    this.loadTaskDetails();
  },

  async loadTaskDetails() {
    try {
      wx.showLoading({ title: '加载中', mask: true });
      const task = await api.task.detail(this.taskId);

      if (!task || task.userId !== app.globalData.userId) {
        throw { statusCode: 403 };
      }

      this.setData({
        form: { ...task },
        originalData: { ...task },
        loading: false
      });

    } catch (err) {
      this.handleApiError(err);
      setTimeout(() => wx.navigateBack(), 1500);
    } finally {
      wx.hideLoading();
    }
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value.trim();
    this.setData({
      [`form.${field}`]: value,
      isDataChanged: this.checkDataChanged(field, value),
      errorMessage: ''
    });
  },

  checkDataChanged(field, value) {
    return value !== this.data.originalData[field];
  },

  selectCategory(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({
      'form.category': name,
      isDataChanged: this.checkDataChanged('category', name),
      errorMessage: ''
    });
  },

  handleDateChange(e) {
    const value = e.detail.value;
    const isChanged = value !== this.data.originalData.dueDate;
    const error = validate.dueDate(value, isChanged);

    if (error) {
      wx.vibrateShort();
      this.setData({ errorMessage: error });
      return;
    }

    if (this.data.form.remindTime) {
      const timeError = validate.datetime(value, this.data.form.remindTime);
      if (timeError) return this.setData({ errorMessage: timeError });
    }

    this.setData({
      'form.dueDate': value,
      errorMessage: '',
      isDataChanged: true
    });
  },

  handleTimeChange(e) {
    const value = e.detail.value;
    if (!this.data.form.dueDate) {
      return this.setData({ errorMessage: '请先选择日期' });
    }

    const error = validate.datetime(this.data.form.dueDate, value);
    if (error) {
      wx.vibrateShort();
      return this.setData({ errorMessage: error });
    }

    this.setData({
      'form.remindTime': value,
      isDataChanged: this.checkDataChanged('remindTime', value),
      errorMessage: ''
    });
  },

  async submitForm() {
    if (this.data.loading) return;
    this.setData({ errorMessage: '' });

    const errors = {
      title: validate.title(this.data.form.title),
      category: validate.category(this.data.form.category),
      dueDate: validate.dueDate(
        this.data.form.dueDate,
        this.data.form.dueDate !== this.data.originalData.dueDate
      )
    };

    const datetimeError = validate.datetime(
      this.data.form.dueDate,
      this.data.form.remindTime
    );

    const errorPriority = ['title', 'category', 'dueDate'];
    for (let field of errorPriority) {
      if (errors[field]) {
        wx.vibrateShort();
        return this.setData({ errorMessage: errors[field] });
      }
    }

    if (datetimeError) {
      wx.vibrateShort();
      return this.setData({ errorMessage: datetimeError });
    }

    if (!this.data.isDataChanged) {
      wx.vibrateShort();
      return wx.showToast({ title: '未修改任何内容', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '保存中', mask: true });
      // 修改这行调用方式
      const res = await api.task.updateV2(this.taskId, {
        ...this.data.form,
        userId: app.globalData.userId
      });
    
      if (res.code === 409) { // 处理名称冲突
        wx.vibrateShort();
        return this.setData({ errorMessage: res.message });
      }
    
      if (res.code !== 200) {
        throw new Error(res.message);
      }
    
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        complete: () => wx.navigateBack()
      });
    } catch (err) {
      this.handleApiError(err);
    } finally {
      wx.hideLoading();
    }
  },

  async toggleStatus() {
    const newStatus = this.data.form.status === '完成' ? '未完成' : '完成';

    try {
      await api.task.updateStatus(this.taskId, newStatus);
      this.setData({
        'form.status': newStatus,
        isDataChanged: true
      });
      wx.showToast({
        title: `标记为${newStatus}`,
        icon: 'none'
      });
    } catch (err) {
      wx.vibrateShort();
      this.handleApiError(err);
    }
  },

  handleDelete() {
    this.setData({
      showDeleteConfirm: true
    });
  },

  closeDeleteConfirm() {
    this.setData({
      showDeleteConfirm: false
    });
  },

  async confirmDelete() {
    try {
      wx.showLoading({
        title: '删除中'
      });
      await api.task.delete(this.taskId);

      wx.showToast({
        title: '删除成功',
        icon: 'success',
        complete: () => wx.navigateBack()
      });
    } catch (err) {
      wx.vibrateShort();
      this.handleApiError(err);
    } finally {
      wx.hideLoading();
      this.closeDeleteConfirm();
    }
  },

  handleApiError(err) {
    const message = err.statusCode === 401 ? '请重新登录' :
      err.statusCode === 403 ? '无操作权限' :
      err.statusCode === 404 ? '任务不存在' :
      '网络请求失败';

    this.setData({
      errorMessage: message
    });
    wx.showToast({
      title: message,
      icon: 'none'
    });
    wx.vibrateShort();

    if ([401, 403, 404].includes(err.statusCode)) {
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  navigateBack() {
    wx.navigateBack();
  }
});