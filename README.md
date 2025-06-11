# 📝 待办事项管理小程序 - 项目文档

## 🚀 项目概述  
待办事项管理小程序是一款基于微信生态的任务管理工具，采用前后端分离架构开发。系统支持用户注册登录、任务全生命周期管理（创建/编辑/删除/状态更新）、数据可视化统计（任务分类分布与时间分布）等功能，帮助用户高效规划时间并提升工作效率。

![小程序概览](https://github.com/user-attachments/assets/310345b5-e68e-4641-a7c5-8093a94f8876)

## 🛠 技术栈

### 💻 前端
- **微信小程序**：原生框架开发
- **图表库**：📊 ECharts
- **UI组件**：微信原生组件 + 自定义组件

### ⚙️ 后端
- **框架**：Spring Boot 3.0.5 🍃
- **数据库**：MySQL 8.0 🗄️
- **持久层**：MyBatis + Druid
- **API规范**：RESTful

### 🗃️ 数据库设计
```sql
-- 👤 用户表
CREATE TABLE user (
  userId VARCHAR(20) PRIMARY KEY,
  password VARCHAR(255) NOT NULL
);

-- ✅ 任务表
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
```

## 🔥 核心功能

### 📱 微信小程序端
1. **🔐 用户认证系统**
   - 登录/注册双状态切换
   - 实时表单校验（用户ID长度、密码格式、一致性验证）
   - 安全密码传输与存储

2. **✅ 任务管理**
   - 智能任务列表（按时间紧迫性排序）
   - 四状态分类展示（全部/进行中/已完成/已逾期）
   - 逾期任务红色警示 ⚠️
   - 长按删除确认机制
   - 模糊搜索功能（标题/描述）🔍

3. **➕ 任务创建与编辑**
   - 表单验证（标题长度、日期有效性）
   - 分类标签选择器
   - 日期/时间选择组件 ⏰
   - 任务状态快速切换
   - 防重名校验

4. **📊 数据可视化**
   - 分类占比饼图
   - 时间分布柱状图
   - 周/月/年多维度统计

5. **👤 个人中心**
   - 微信头像/昵称同步
   - 密码修改（旧密码验证）🔑
   - 系统信息展示
   - 缓存管理
   - 通知设置开关

![任务管理界面](https://github.com/user-attachments/assets/aaa15a0f-cebb-425f-b420-1ff310e5a976)
![数据统计界面](https://github.com/user-attachments/assets/267cf403-c7ee-44d1-b5ce-e38fb67205ee)
![个人中心界面](https://github.com/user-attachments/assets/251a11b4-0b85-42a8-b565-85246678259e)

## 🗂 项目结构

### 微信小程序目录
```
├── pages
│   ├── login          # 🔐 登录/注册
│   ├── index          # 📋 任务列表
│   ├── add-task       # ➕ 添加任务
│   ├── edit-task      # ✏️ 编辑任务
│   ├── stats          # 📊 数据统计
│   └── profile        # 👤 个人中心
├── components         # 🧩 自定义组件
│   ├── search-bar     # 🔍 搜索框
│   ├── task-card      # 📝 任务卡片
│   └── echarts        # 📈 图表组件
├── utils
│   ├── api.js         # 🌐 网络请求封装
│   └── util.js        # ⚙️ 工具函数（时间格式化/校验器）
├── app.js             # 🚀 小程序入口
├── app.json           # ⚙️ 全局配置
└── app.wxss           # 🎨 全局样式
```

## ✨ 亮点功能
1. **🧠 智能任务排序**：临近截止日期的任务自动置顶 ⏱️  
2. **🌅 时间敏感问候**：根据当前时间显示不同问候语  
   - ☀️ 早上好
   - 🌤️ 中午好
   - 🌇 下午好
   - 🌙 晚上好
   - 🌜 夜深了
3. **🔄 双端数据同步**：小程序与Web管理端数据实时同步  
4. **💫 交互反馈系统**：
   - 表单错误震动提示 📳
   - 操作成功动画反馈 ✅
   - 加载状态指示器 ⏳
5. **🎨 主题记忆功能**：自动保存用户选择的主题  
6. **🔔 智能提醒系统**：自定义任务提醒时间 ⏰  
7. **📈 动态图表更新**：数据变更实时刷新可视化图表  


### 微信小程序
1. 微信开发者工具导入项目
2. 配置`utils/api.js`中的基础URL
3. 使用测试账号或注册新账号体验

## 📸 截图展示
| 功能         | 截图展示 |
|--------------|----------|
| **登录页面** | ![登录界面](media/image5.png) |
| **任务列表** | ![任务列表](media/image6.png) |
| **添加任务** | ![添加任务](media/image11.png) |
| **数据统计** | ![数据统计](media/image22.png) |
