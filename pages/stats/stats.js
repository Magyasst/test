// pages/stats/stats.js
import * as echarts from '../../components/ec-canvas/echarts';
const app = getApp();
const api = require('../../utils/api');

// 完成状态图表配置
const initCompletionChart = (canvas, width, height, dpr) => {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const option = {
    tooltip: {
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      itemWidth: 24,
      itemHeight: 24,
      textStyle: {
        color: '#718096'
      }
    },
    color: ['#67d6a3', '#ff7474'],
    series: [{
      name: '完成状态',
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 32,
          fontWeight: 'bold'
        }
      },
      data: []
    }]
  };

  chart.setOption(option);
  return chart;
};

// 分类分布图表配置
const initCategoryChart = (canvas, width, height, dpr) => {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      itemWidth: 24,
      itemHeight: 24,
      textStyle: {
        color: '#718096'
      }
    },
    color: ['#5b8cff', '#ffc742', '#a56cff', '#ff9f40'],
    series: [{
      name: '任务分类',
      type: 'pie',
      radius: ['35%', '65%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 28
        }
      },
      data: []
    }]
  };

  chart.setOption(option);
  return chart;
};

Page({
  data: {
    loading: true,
    statsData: {
      total: 0,
      completionRate: 0,
      categories: []
    },
    timeRanges: [
      { value: 'week', name: '本周' },
      { value: 'month', name: '本月' },
      { value: 'year', name: '本年' }
    ],
    timeRangeIndex: 0,
    ec1: { onInit: initCompletionChart },
    ec2: { onInit: initCategoryChart },
    updateTime: '--'
  },

  onLoad() {
    if (!app.globalData.userId) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.loadStats();
  },

  async loadStats() {
    this.setData({ loading: true });
    try {
      const params = {
        userId: app.globalData.userId,
        range: this.data.timeRanges[this.data.timeRangeIndex].value
      };
      
      const categoryRes = await api.stats.get(params);
      this.processData(categoryRes);
      this.setData({
        updateTime: new Date().toLocaleString()
      });
    } catch (err) {
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  processData(categoryData) {
    const totalTasks = categoryData.reduce((sum, item) => sum + item.total, 0);
    const completedTasks = categoryData.reduce((sum, item) => sum + item.completed, 0);
    
    // 完成状态数据
    const completionData = [
      { value: completedTasks, name: '已完成' },
      { value: totalTasks - completedTasks, name: '未完成' }
    ];

    // 分类分布数据
    const categoryChartData = categoryData.map(item => ({
      value: item.total,
      name: item.category || '未分类'
    }));

    this.setData({
      statsData: {
        total: totalTasks,
        completionRate: totalTasks ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
        categories: categoryData
      }
    });

    // 更新图表
    this.updateCharts(completionData, categoryChartData);
  },

  updateCharts(completionData, categoryData) {
    const completionChart = this.selectComponent('#completion-chart');
    const categoryChart = this.selectComponent('#category-chart');

    completionChart.init((canvas, width, height, dpr) => {
      const chart = initCompletionChart(canvas, width, height, dpr);
      chart.setOption({
        series: [{ data: completionData }]
      });
      return chart;
    });

    categoryChart.init((canvas, width, height, dpr) => {
      const chart = initCategoryChart(canvas, width, height, dpr);
      chart.setOption({
        series: [{ data: categoryData }]
      });
      return chart;
    });
  },

  changeTimeRange(e) {
    this.setData({ timeRangeIndex: e.detail.value }, () => {
      this.loadStats();
    });
  }
});