// utils/util.js
const DATE_FORMATS = {
  'date': 'YYYY-MM-DD',
  'datetime': 'YYYY-MM-DD HH:mm',
  'relative': 'relative'
};

function formatTime(date, format = 'datetime') {
  if (!date) return '';
  const targetDate = date instanceof Date ? date : new Date(date);
  if (isNaN(targetDate)) return '';

  const formatPattern = DATE_FORMATS[format] || format;
  
  if (formatPattern === 'relative') {
    return getRelativeTime(targetDate);
  }

  const pad = n => n.toString().padStart(2, '0');
  
  const year = targetDate.getFullYear();
  const month = pad(targetDate.getMonth() + 1);
  const day = pad(targetDate.getDate());
  const hour = pad(targetDate.getHours());
  const minute = pad(targetDate.getMinutes());

  return formatPattern
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute);
}

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  return formatTime(date, 'date');
}

// 表单验证工具
// utils/util.js 新增分类验证器
const validator = {
  title: (value) => {
    if (!value) return '标题不能为空。';
    if (value.length > 8) return '标题不能超过8个字';
    return null;
  },
  category: (value) => {  // 新增分类验证
    if (!value) return '请选择任务分类';
    return null;
  },
  dueDate: (value) => {
    if (!value) return '请选择截止日期';
    if (new Date(value) < new Date().setHours(0,0,0,0)) 
      return '日期不能早于今天';
    return null;
  }
}

module.exports = {
  formatTime,
  validator
};