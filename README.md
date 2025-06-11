待办事项管理小程序 - 项目文档
项目概述
待办事项管理小程序是一款基于微信生态的任务管理工具，采用前后端分离架构开发。系统支持用户注册登录、任务全生命周期管理（创建/编辑/删除/状态更新）、数据可视化统计（任务分类分布与时间分布）等功能，帮助用户高效规划时间并提升工作效率。
![image](https://github.com/user-attachments/assets/310345b5-e68e-4641-a7c5-8093a94f8876)

技术栈
前端
微信小程序：原生框架开发
图表库：ECharts
UI组件：微信原生组件
后端
框架：Spring Boot 3.0.5

数据库：MySQL 8.0

持久层：MyBatis + Druid

API规范：RESTful

数据库设计
sql
-- 用户表
CREATE TABLE user (
  userId VARCHAR(20) PRIMARY KEY,
  password VARCHAR(255) NOT NULL
);

-- 任务表
CREATE TABLE person (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(8) NOT NULL,
  description VARCHAR(20),
  category VARCHAR(10),
  dueDate VARCHAR(10),
  userId VARCHAR(20) NOT NULL,
  remindTime VARCHAR(20),
  status VARCHAR(6) DEFAULT '未完成',
  UNIQUE INDEX idx_user_title (userId, title),
  FOREIGN KEY (userId) REFERENCES user(userId)
);
核心功能
![image](https://github.com/user-attachments/assets/aaa15a0f-cebb-425f-b420-1ff310e5a976)
![image](https://github.com/user-attachments/assets/267cf403-c7ee-44d1-b5ce-e38fb67205ee)
![image](https://github.com/user-attachments/assets/251a11b4-0b85-42a8-b565-85246678259e)

微信小程序端
用户认证系统

登录/注册双状态切换

实时表单校验（用户ID长度、密码格式、一致性验证）

安全密码传输与存储

任务管理

智能任务列表（按时间紧迫性排序）

四状态分类展示（全部/进行中/已完成/已逾期）

逾期任务红色警示

长按删除确认机制

模糊搜索功能（标题/描述）

任务创建与编辑

表单验证（标题长度、日期有效性）

分类标签选择器

日期/时间选择组件

任务状态快速切换

防重名校验

数据可视化

分类占比饼图

时间分布柱状图

周/月/年多维度统计

个人中心

微信头像/昵称同步

密码修改（旧密码验证）

系统信息展示

缓存管理

通知设置开关

项目结构
微信小程序目录
text
├── pages
│   ├── login          # 登录/注册
│   ├── index          # 任务列表
│   ├── add-task       # 添加任务
│   ├── edit-task      # 编辑任务
│   ├── stats          # 数据统计
│   └── profile        # 个人中心
├── components         # 自定义组件
│   ├── search-bar     # 搜索框
│   ├── task-card      # 任务卡片
│   └── echarts        # 图表组件
├── utils
│   ├── api.js         # 网络请求封装
│   └── util.js        # 工具函数（时间格式化/校验器）
├── app.js             # 小程序入口
├── app.json           # 全局配置
└── app.wxss           # 全局样式

智能任务排序：临近截止日期的任务自动置顶

时间敏感问候：根据当前时间显示不同问候语

双端数据同步：小程序与Web管理端数据实时同步

交互反馈系统：

表单错误震动提示

操作成功动画反馈
