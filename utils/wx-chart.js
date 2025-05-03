// utils/wx-chart.js
class WxChart {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
  }

  baseConfig(title) {
    this.ctx.setFontSize(12);
    this.ctx.setFillStyle('#64748b');
    this.ctx.fillText(title, this.width/2 - 40, 30);
    this.ctx.beginPath();
    this.ctx.moveTo(50, 60);
    this.ctx.lineTo(50, this.height - 40);
    this.ctx.lineTo(this.width - 30, this.height - 40);
    this.ctx.setStrokeStyle('#e2e8f0');
    this.ctx.stroke();
  }

  drawBarChart(data, title) {
    this.baseConfig(title);
    const barWidth = (this.width - 100) / data.length - 10;
    const maxValue = Math.max(...data.map(d => d.value));
    
    data.forEach((item, index) => {
      const x = 60 + index * (barWidth + 10);
      const height = (item.value / maxValue) * (this.height - 120);
      
      this.ctx.setFillStyle(item.color || this.colors[index % 4]);
      this.ctx.fillRect(x, this.height - 40 - height, barWidth, height);
      
      this.ctx.setFillStyle('#64748b');
      this.ctx.fillText(item.name, x + barWidth/2 - 10, this.height - 20);
    });
  }

  drawPieChart(data, title) {
    this.baseConfig(title);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = -Math.PI / 2;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    data.forEach((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      this.ctx.setFillStyle(item.color || this.colors[index % 4]);
      this.ctx.fill();
      startAngle += angle;
    });
  }

  drawRingChart(progress, colors, text) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // 绘制背景环
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.setStrokeStyle(colors[1]);
    this.ctx.setLineWidth(12);
    this.ctx.stroke();

    // 绘制进度环
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI * 2 * progress - Math.PI / 2);
    this.ctx.setStrokeStyle(colors[0]);
    this.ctx.setLineWidth(12);
    this.ctx.setLineCap('round');
    this.ctx.stroke();

    // 绘制中间文字
    this.ctx.setFontSize(32);
    this.ctx.setFillStyle('#1E293B');
    this.ctx.setTextAlign('center');
    this.ctx.fillText(text, centerX, centerY + 12);
    
    this.ctx.draw();
  }
}

module.exports = WxChart;