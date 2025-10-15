# 支付功能实现指南

## 概述

支付功能已完全集成到B2B商务平台中，包括完整的Stripe支付处理流程。

## 已实现的功能

### 1. 支付流程
- ✅ Stripe支付集成
- ✅ 支付意图创建
- ✅ 支付成功/失败页面
- ✅ Webhook处理支付状态更新
- ✅ 数据库支付记录

### 2. 用户界面
- ✅ 产品详情页面的报价请求按钮
- ✅ 报价请求表单页面
- ✅ 安全支付页面
- ✅ 支付成功确认页面
- ✅ 支付失败处理页面

### 3. 管理员功能
- ✅ 报价单管理页面
- ✅ 支付链接生成
- ✅ 支付状态追踪

## 文件结构

```
src/
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   └── create-payment-intent/
│   │   │       └── route.ts          # 创建支付意图
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts          # Stripe Webhook处理
│   ├── payment/
│   │   ├── page.tsx                   # 支付页面入口
│   │   ├── PaymentPageContent.tsx     # 支付页面内容
│   │   ├── success/
│   │   │   ├── page.tsx               # 支付成功页面
│   │   │   └── PaymentSuccessContent.tsx
│   │   └── failed/
│   │       ├── page.tsx               # 支付失败页面
│   │       └── PaymentFailedContent.tsx
│   ├── quote/
│   │   ├── page.tsx                   # 报价请求页面
│   │   └── QuotePageContent.tsx      # 报价请求内容
│   └── admin/
│       └── quotes/
│           ├── page.tsx               # 报价单管理页面
│           └── QuotesManagementContent.tsx
├── components/
│   └── QuoteDialog.tsx               # 报价对话框组件
└── lib/
    └── stripe.ts                     # Stripe集成工具
```

## 配置要求

### 环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5433/b2b_business"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Stripe (必需)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Email (可选)
EMAIL_HOST="smtp.exmail.qq.com"
EMAIL_PORT="465"
EMAIL_USER="your-email@example.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="your-email@example.com"
```

### Stripe配置

1. 在 [Stripe Dashboard](https://dashboard.stripe.com) 创建账户
2. 获取你的API密钥：
   - **Publishable Key**: 用于前端支付表单
   - **Secret Key**: 用于后端API调用
   - **Webhook Secret**: 用于验证Webhook签名
3. 在Stripe Dashboard中配置Webhook端点：`https://yourdomain.com/api/webhooks/stripe`

## 使用流程

### 客户流程

1. **浏览产品**：客户在产品详情页面浏览产品
2. **请求报价**：点击"Request Quote"按钮跳转到报价表单
3. **填写信息**：客户填写联系信息和产品需求
4. **管理员处理**：管理员查看报价请求并创建正式报价单
5. **发送报价**：管理员批准报价单并发送给客户
6. **客户支付**：客户点击支付链接进入支付页面
7. **完成支付**：客户使用Stripe完成支付
8. **支付确认**：客户收到支付成功确认

### 管理员流程

1. **查看报价请求**：在联系人管理中查看客户报价请求
2. **创建报价单**：在报价单管理中创建正式报价单
3. **审批报价**：审批报价单并设置为"已发送"状态
4. **生成支付链接**：为已发送的报价单生成支付链接
5. **监控支付**：追踪支付状态和订单完成情况

## API端点

### 支付相关

- `POST /api/payments/create-payment-intent` - 创建支付意图
- `POST /api/webhooks/stripe` - 处理Stripe Webhook

### 报价相关

- `POST /api/quote` - 提交报价请求
- `GET /api/admin/quotes` - 获取报价单列表
- `GET /api/admin/quotes/[id]` - 获取单个报价单详情

## 数据库模型

### Quote（报价单）
- 报价单号、客户信息、报价项目、金额、状态等
- 与Customer、User模型关联

### Payment（支付记录）
- 支付金额、货币、状态、Stripe支付意图ID等
- 与Quote、Customer模型关联

### Customer（客户）
- 客户信息、联系方式、Stripe客户ID等

## 测试支付功能

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **配置Stripe**：
   - 复制 `.env.example` 到 `.env.local`
   - 填写真实的Stripe密钥

3. **测试流程**：
   - 访问产品页面 → 点击"Request Quote"
   - 填写报价请求表单
   - 管理员登录查看报价请求
   - 创建并发送报价单
   - 点击支付链接测试支付流程

## 安全考虑

- ✅ 使用HTTPS加密传输
- ✅ Stripe PCI DSS合规
- ✅ 环境变量存储敏感信息
- ✅ Webhook签名验证
- ✅ 支付状态验证

## 故障排除

### 常见问题

1. **支付按钮不显示**
   - 检查Stripe环境变量是否正确配置
   - 确认Stripe密钥有效性

2. **支付失败**
   - 检查网络连接
   - 验证Stripe账户余额
   - 确认Webhook端点配置正确

3. **Webhook不工作**
   - 验证Webhook签名密钥
   - 检查网络连接和防火墙设置
   - 查看服务器日志排查错误

## 部署准备

生产环境部署前，请确保：

1. **环境变量**：使用真实的生产环境变量
2. **域名配置**：配置正确的域名和HTTPS证书
3. **Webhook端点**：在Stripe中配置生产环境的Webhook URL
4. **数据库**：确保生产数据库包含所有必要的数据表

## 未来增强

- [ ] 多货币支持
- [ ] 发票自动生成和发送
- [ ] 支付方式扩展（PayPal、银行转账等）
- [ ] 退款处理功能
- [ ] 支付分析和报告
- [ ] 批量支付处理

---

**更新时间**: 2025-01-13
**状态**: ✅ 支付功能已完全实现并集成
