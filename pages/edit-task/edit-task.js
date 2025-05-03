// pages/edit-task/edit-task.js
const app = getApp();
const api = require('../../utils/api');
const { formatTime, validator } = require('../../utils/util');

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
    errorMessage: ''
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
    this.setData({
      [`form.${field}`]: e.detail.value,
      isDataChanged: this.checkDataChanged(field, e.detail.value)
    });
  },

  checkDataChanged(field, value) {
    return value !== this.data.originalData[field];
  },

  selectCategory(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({
      'form.category': name,
      isDataChanged: this.checkDataChanged('category', name)
    });
  },

  handleDateChange(e) {
    const value = e.detail.value;
    
    // 添加日期格式验证
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return this.setData({ errorMessage: '日期格式不正确' });
    }
  
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (selectedDate < today) {
      return this.setData({ errorMessage: '日期不能早于今天' });
    }
  
    this.setData({
      'form.dueDate': value,
      errorMessage: '',
      isDataChanged: true
    });
  
    // 强制更新视图
    this.setData({ 
      'form.dueDate': value 
    });
  },

  handleTimeChange(e) {
    const value = e.detail.value;
    this.setData({
      'form.remindTime': value,
      isDataChanged: this.checkDataChanged('remindTime', value)
    });
  },

  async submitForm() {
    if (this.data.loading) return;

    this.setData({ errorMessage: '' });

    // 使用正确的验证方法
    const errors = [
      validator.title(this.data.form.title),
      validator.category(this.data.form.category),
      validator.dueDate(this.data.form.dueDate)
    ].filter(e => e);

    if (errors.length > 0) {
      return this.setData({ errorMessage: errors[0] });
    }

    if (!this.data.isDataChanged) {
      return wx.showToast({ title: '未修改任何内容', icon: 'none' });
    }

    try {
      wx.showLoading({ title: '保存中', mask: true });
      
      await api.task.update(this.taskId, {
        ...this.data.form,
        userId: app.globalData.userId
      });

      wx.showToast({
        title: '更新成功',
        icon: 'success',
        complete: () => wx.navigateBack()
      });

    } catch (err) {
      console.error('保存失败:', err);
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
      wx.showToast({ title: `标记为${newStatus}`, icon: 'none' });
    } catch (err) {
      this.handleApiError(err);
    }
  },

  handleDelete() {
    this.setData({ showDeleteConfirm: true });
  },

  async confirmDelete() {
    try {
      wx.showLoading({ title: '删除中' });
      await api.task.delete(this.taskId);
      
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        complete: () => wx.navigateBack()
      });
    } catch (err) {
      this.handleApiError(err);
    } finally {
      wx.hideLoading();
      this.setData({ showDeleteConfirm: false });
    }
  },

  handleApiError(err) {
    const message = err.statusCode === 401 ? '请重新登录' :
                   err.statusCode === 403 ? '无操作权限' :
                   err.statusCode === 404 ? '任务不存在' :
                   '网络请求失败';

    this.setData({ errorMessage: message });
    wx.showToast({ title: message, icon: 'none' });

    if ([401, 403, 404].includes(err.statusCode)) {
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  navigateBack() {
    wx.navigateBack();
  }
});