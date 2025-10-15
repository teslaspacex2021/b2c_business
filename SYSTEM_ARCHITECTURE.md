# B2B Business Platform - 系统架构文档

## 📋 项目概述

B2B Business Platform 是一个基于 Next.js 15 的现代化B2B业务平台，采用全栈架构，提供完整的产品展示、博客管理、客户关系管理和客服系统。

## 🏗️ 技术架构

### 核心技术栈
- **前端框架**: Next.js 15.1.0 + React 19.0.0
- **开发语言**: TypeScript
- **样式系统**: Tailwind CSS + shadcn/ui
- **数据库**: PostgreSQL + Prisma ORM
- **认证系统**: NextAuth.js
- **邮件服务**: Nodemailer
- **支付系统**: Stripe
- **部署方案**: Docker + Vercel

### 架构模式
- **前后端一体化**: Next.js App Router
- **API设计**: RESTful API + Server Actions
- **数据库设计**: 关系型数据库 + ORM
- **状态管理**: React Server Components + Client Components
- **文件存储**: 本地文件系统 + 云存储支持

## 📁 项目结构

```
b2b_business/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 管理后台布局组
│   │   ├── admin/             # 管理后台页面
│   │   │   ├── analytics/     # 数据分析
│   │   │   ├── customers/     # 客户管理
│   │   │   ├── email-config/  # 邮件配置
│   │   │   ├── email-templates/ # 邮件模板
│   │   │   ├── media/         # 媒体管理
│   │   │   ├── products/      # 产品管理
│   │   │   ├── social-media/  # 社交媒体
│   │   │   ├── support/       # 客服系统
│   │   │   └── users/         # 用户管理
│   │   ├── api/               # API路由
│   │   │   ├── admin/         # 管理API
│   │   │   ├── auth/          # 认证API
│   │   │   ├── payments/      # 支付API
│   │   │   ├── social-media/  # 社交媒体API
│   │   │   ├── support/       # 客服API
│   │   │   └── webhooks/      # Webhook处理
│   │   ├── blog/              # 博客页面
│   │   ├── contact/           # 联系页面
│   │   └── product/           # 产品页面
│   ├── components/            # 可复用组件
│   │   ├── admin/             # 管理后台组件
│   │   ├── forms/             # 表单组件
│   │   ├── layout/            # 布局组件
│   │   ├── providers/         # Context Providers
│   │   └── ui/                # UI基础组件
│   ├── hooks/                 # 自定义Hooks
│   ├── lib/                   # 工具库
│   │   ├── auth/              # 认证相关
│   │   ├── database/          # 数据库工具
│   │   ├── db/                # 数据库连接
│   │   ├── i18n/              # 国际化
│   │   └── utils/             # 通用工具
│   └── types/                 # TypeScript类型定义
├── prisma/                    # 数据库相关
│   ├── migrations/            # 数据库迁移
│   ├── schema.prisma          # 数据库模式
│   └── seed-*.ts              # 种子数据
├── public/                    # 静态资源
│   ├── images/                # 图片资源
│   └── uploads/               # 上传文件
├── docker/                    # Docker配置
├── scripts/                   # 脚本文件
└── 配置文件                   # 各种配置文件
```

## 🗄️ 数据库设计

### 核心数据模型

#### 用户系统
- **User**: 用户基础信息和认证
- **Role**: ADMIN, EDITOR, USER 三种角色
- **Status**: ACTIVE, INACTIVE 状态管理

#### 内容管理
- **Product**: 产品信息管理
- **Category**: 分层分类系统
- **BlogPost**: 博客文章管理
- **CustomPage**: 自定义页面

#### 客户关系管理 (CRM)
- **Customer**: 客户基础信息
- **Contact**: 联系表单提交
- **Quote**: 报价单管理
- **CustomerInteraction**: 客户互动记录
- **Payment**: 支付记录

#### 客服系统
- **SupportSession**: 客服会话
- **SupportMessage**: 客服消息
- **SupportTransfer**: 会话转接
- **SupportKnowledge**: 知识库
- **SupportQuickReply**: 快捷回复

#### 系统配置
- **SiteConfig**: 站点配置
- **SystemConfig**: 系统设置
- **EmailTemplate**: 邮件模板
- **SocialMedia**: 社交媒体链接

### 关系设计
- 用户与内容的一对多关系
- 分类的自引用层级关系
- 客户与互动记录的一对多关系
- 支付与报价的关联关系

## 🔐 安全架构

### 认证授权
- **NextAuth.js**: 统一认证管理
- **JWT Token**: 会话状态管理
- **RBAC**: 基于角色的访问控制
- **中间件保护**: 路由级别的权限控制

### 数据安全
- **密码加密**: bcryptjs 哈希加密
- **SQL注入防护**: Prisma ORM 参数化查询
- **XSS防护**: React 内置防护 + 输入验证
- **CSRF防护**: Next.js 内置防护

### API安全
- **请求验证**: Zod schema 验证
- **速率限制**: API 调用频率控制
- **错误处理**: 统一错误响应格式
- **日志记录**: 操作审计日志

## 🌐 前端架构

### 组件架构
- **Server Components**: 服务端渲染组件
- **Client Components**: 客户端交互组件
- **共享组件**: UI组件库 (shadcn/ui)
- **布局组件**: 页面布局管理

### 状态管理
- **Server State**: 数据库数据通过 Server Components
- **Client State**: React useState/useReducer
- **Form State**: React Hook Form
- **Global State**: Context API

### 路由设计
- **App Router**: Next.js 13+ 路由系统
- **动态路由**: [id] 参数路由
- **路由组**: (admin) 布局组
- **中间件**: 认证和权限检查

## 🔧 后端架构

### API设计
- **RESTful API**: 标准 REST 接口
- **Server Actions**: Next.js 服务端操作
- **API Routes**: 文件系统路由
- **中间件**: 认证、验证、错误处理

### 数据层
- **Prisma ORM**: 类型安全的数据库操作
- **Connection Pool**: 数据库连接池
- **Migration**: 数据库版本管理
- **Seeding**: 初始数据填充

### 服务层
- **Email Service**: 邮件发送服务
- **File Upload**: 文件上传处理
- **Payment Service**: Stripe 支付集成
- **Notification Service**: 通知系统

## 📱 用户界面

### 用户端 (全英文)
- **首页**: Hero区域 + 产品展示 + CTA
- **产品页面**: 产品网格 + 筛选 + 详情
- **博客页面**: 文章列表 + 分类 + 订阅
- **关于页面**: 公司介绍 + 团队展示
- **联系页面**: 联系表单 + FAQ + 地图

### 管理后台
- **仪表盘**: 数据统计 + 快速操作
- **产品管理**: CRUD + 批量操作 + 导入导出
- **博客管理**: 富文本编辑 + SEO优化
- **客户管理**: CRM功能 + 互动记录
- **客服系统**: 实时聊天 + 工单管理
- **系统设置**: 配置管理 + 权限控制

## 🔄 数据流

### 请求流程
1. **用户请求** → 中间件验证 → 路由处理
2. **API调用** → 参数验证 → 业务逻辑 → 数据库操作
3. **响应返回** → 错误处理 → 日志记录 → 客户端

### 数据同步
- **实时更新**: Server-Sent Events (SSE)
- **缓存策略**: Next.js 内置缓存 + 数据库查询优化
- **文件同步**: 本地存储 + 云存储备份

## 🚀 部署架构

### 开发环境
- **本地开发**: pnpm dev + Docker PostgreSQL
- **热重载**: Next.js Turbopack
- **调试工具**: Prisma Studio + Chrome DevTools

### 生产环境
- **容器化**: Docker + Docker Compose
- **数据库**: PostgreSQL 云服务
- **CDN**: 静态资源加速
- **监控**: 性能监控 + 错误追踪

## 📊 性能优化

### 前端优化
- **代码分割**: Next.js 自动分割
- **图片优化**: Next.js Image 组件
- **字体优化**: 字体预加载
- **缓存策略**: 浏览器缓存 + CDN缓存

### 后端优化
- **数据库优化**: 索引优化 + 查询优化
- **API缓存**: 响应缓存 + 数据缓存
- **连接池**: 数据库连接复用
- **异步处理**: 后台任务队列

## 🔍 监控和日志

### 应用监控
- **性能监控**: 页面加载时间 + API响应时间
- **错误监控**: 错误捕获 + 堆栈追踪
- **用户行为**: 页面访问 + 操作统计

### 系统日志
- **访问日志**: HTTP请求记录
- **操作日志**: 用户操作审计
- **错误日志**: 系统错误记录
- **性能日志**: 系统性能指标

## 🔮 扩展性设计

### 水平扩展
- **无状态设计**: 服务无状态化
- **负载均衡**: 多实例部署
- **数据库分片**: 数据水平分割
- **缓存集群**: Redis 集群

### 功能扩展
- **插件系统**: 模块化功能扩展
- **API版本**: 向后兼容的API设计
- **多租户**: SaaS化支持
- **国际化**: 多语言支持框架

---

## 📋 技术决策记录

### 为什么选择 Next.js 15?
- **全栈框架**: 前后端一体化开发
- **性能优秀**: Server Components + 自动优化
- **开发体验**: 热重载 + TypeScript 支持
- **生态丰富**: 丰富的第三方库支持

### 为什么选择 Prisma?
- **类型安全**: TypeScript 原生支持
- **开发效率**: 自动生成客户端
- **迁移管理**: 版本化数据库变更
- **查询优化**: 智能查询生成

### 为什么选择 PostgreSQL?
- **功能丰富**: 完整的SQL支持
- **性能优秀**: 高并发处理能力
- **扩展性好**: 支持复杂查询和索引
- **开源稳定**: 成熟的开源数据库

---

**文档版本**: 1.0  
**最后更新**: 2025-01-13  
**维护者**: AI Assistant
