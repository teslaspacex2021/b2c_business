# B2C Business Platform

一个现代化的 B2C (Business-to-Consumer) 电商平台，专注于为终端消费者提供优质的购物体验。

## 🌟 核心特性

### 💳 支付功能
- **Stripe 集成**: 安全的在线支付处理
- **多种支付方式**: 信用卡、借记卡等
- **订单管理**: 完整的订单生命周期管理
- **支付历史**: 详细的交易记录

### 🛒 购物体验
- **购物车**: 灵活的购物车管理
- **即时结账**: 快速便捷的结账流程
- **产品浏览**: 直观的产品展示和搜索
- **用户评价**: 产品评分和评论系统

### 🎯 用户功能
- **用户注册/登录**: 安全的身份认证
- **个人资料**: 用户信息管理
- **订单历史**: 历史订单查看
- **收藏夹**: 产品收藏功能

## 🛠️ 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS, Radix UI
- **数据库**: PostgreSQL + Prisma ORM
- **支付**: Stripe
- **认证**: NextAuth.js
- **部署**: Docker

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Docker & Docker Compose
- pnpm

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/teslaspacex2021/b2c_business.git
cd b2c_business
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下变量：
```env
# 数据库配置
DATABASE_URL="postgresql://postgres:postgres123@localhost:5434/b2c_business"

# Stripe 配置
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 邮件配置
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

4. **启动数据库**
```bash
docker-compose up -d
```

5. **数据库迁移**
```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

6. **启动开发服务器**
```bash
pnpm dev
```

访问 http://localhost:3000

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关 API
│   │   ├── payments/      # 支付相关 API
│   │   ├── products/      # 产品相关 API
│   │   └── webhooks/      # Webhook 处理
│   ├── payment/           # 支付页面
│   ├── product/           # 产品页面
│   └── profile/           # 用户资料页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── layout/           # 布局组件
│   └── payment/          # 支付相关组件
├── lib/                  # 工具库
│   ├── stripe.ts         # Stripe 配置
│   └── db.ts            # 数据库配置
└── types/               # TypeScript 类型定义
```

## 🔧 开发指南

### 添加新的支付方式
1. 在 Stripe Dashboard 中配置新的支付方式
2. 更新 `src/lib/stripe.ts` 配置
3. 在支付组件中添加新的支付选项

### 自定义主题
1. 修改 `tailwind.config.ts` 中的颜色配置
2. 更新 `src/app/globals.css` 中的 CSS 变量

### API 开发
所有 API 路由位于 `src/app/api/` 目录下：
- `GET /api/products` - 获取产品列表
- `POST /api/payments/create-payment-intent` - 创建支付意图
- `GET /api/orders` - 获取订单列表

## 🧪 测试

### 支付测试
使用 Stripe 测试卡号：
- 成功支付: `4242 4242 4242 4242`
- 失败支付: `4000 0000 0000 0002`

### 运行测试
```bash
pnpm test
```

## 🚀 部署

### Docker 部署
```bash
docker build -t b2c-business .
docker run -p 3000:3000 b2c-business
```

### 环境变量
生产环境需要配置：
- 真实的 Stripe 密钥
- 生产数据库连接
- SMTP 邮件服务配置

## 📊 管理后台

访问 `/admin` 进入管理后台：
- 默认管理员账号: `admin@example.com`
- 默认密码: `admin123`

管理功能：
- 产品管理
- 订单管理
- 用户管理
- 支付记录
- 系统配置

## 🔒 安全性

- 所有支付数据通过 Stripe 安全处理
- 用户密码使用 bcrypt 加密
- JWT token 用于会话管理
- CSRF 保护
- SQL 注入防护

## 📈 性能优化

- Next.js 图片优化
- 代码分割和懒加载
- 数据库查询优化
- CDN 静态资源加速

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请：
- 创建 [Issue](https://github.com/teslaspacex2021/b2c_business/issues)
- 发送邮件至: support@example.com

---

**系统类型**: B2C (Business-to-Consumer)  
**数据库**: b2c_business (端口 5434)  
**主要功能**: 在线支付、购物车、订单管理