# Git 分支管理策略 (Branching Strategy)

## 📋 概述

本项目采用**双主干分支策略**，同时维护 B2B 和 B2C 两个独立的业务系统。

## 🌳 分支结构

```
├── main (B2C 主分支)
│   ├── feature/b2c-* (B2C 特性分支)
│   ├── hotfix/b2c-* (B2C 热修复分支)
│   └── release/b2c-* (B2C 发布分支)
│
├── b2b-main (B2B 主分支)
│   ├── feature/b2b-* (B2B 特性分支)
│   ├── hotfix/b2b-* (B2B 热修复分支)
│   └── release/b2b-* (B2B 发布分支)
│
└── feature/shared-* (共享特性分支)
```

## 🎯 分支说明

### 主分支

#### `main` - B2C 系统主分支
- **用途**: B2C (Business-to-Consumer) 电商系统
- **基础提交**: 当前最新版本（包含支付功能）
- **特性**: 
  - ✅ Stripe 支付集成
  - ✅ 购物车功能
  - ✅ 即时结账
  - ✅ 在线支付
  - ❌ 询价系统
  - ❌ 批量订购
- **数据库**: `b2c_business` (端口: 5434)
- **部署**: 独立部署
- **保护级别**: 🔒 受保护（需要 PR 审核）

#### `b2b-main` - B2B 系统主分支
- **用途**: B2B (Business-to-Business) 贸易平台
- **基础提交**: `040b23f7aba44f1682762c863a2e34019a9d532e` (无支付功能版本)
- **特性**: 
  - ❌ Stripe 支付集成
  - ❌ 购物车功能
  - ✅ 询价系统
  - ✅ 批量订购
  - ✅ 定制报价
  - ✅ 客户管理
- **数据库**: `b2b_business` (端口: 5433)
- **部署**: 独立部署
- **保护级别**: 🔒 受保护（需要 PR 审核）

### 功能分支

#### B2C 特性分支 (`feature/b2c-*`)
```bash
# 从 main 分支创建
git checkout main
git pull origin main
git checkout -b feature/b2c-shopping-cart-v2

# 开发完成后
git push origin feature/b2c-shopping-cart-v2
# 创建 PR 到 main 分支
```

**命名规范**:
- `feature/b2c-shopping-cart` - 购物车功能
- `feature/b2c-payment-gateway` - 支付网关
- `feature/b2c-user-reviews` - 用户评论
- `feature/b2c-wishlist` - 愿望清单

#### B2B 特性分支 (`feature/b2b-*`)
```bash
# 从 b2b-main 分支创建
git checkout b2b-main
git pull origin b2b-main
git checkout -b feature/b2b-quote-system-v2

# 开发完成后
git push origin feature/b2b-quote-system-v2
# 创建 PR 到 b2b-main 分支
```

**命名规范**:
- `feature/b2b-quote-system` - 询价系统
- `feature/b2b-bulk-order` - 批量订购
- `feature/b2b-custom-pricing` - 定制价格
- `feature/b2b-customer-portal` - 客户门户

#### 共享特性分支 (`feature/shared-*`)
```bash
# 从较早的共同提交点创建
git checkout 040b23f7aba44f1682762c863a2e34019a9d532e
git checkout -b feature/shared-product-catalog-v2

# 开发完成后，分别合并到两个主分支
git checkout b2b-main
git merge feature/shared-product-catalog-v2
git push origin b2b-main

git checkout main
git merge feature/shared-product-catalog-v2
git push origin main
```

**命名规范**:
- `feature/shared-product-catalog` - 产品目录
- `feature/shared-user-auth` - 用户认证
- `feature/shared-admin-panel` - 管理面板
- `feature/shared-blog-system` - 博客系统
- `feature/shared-email-service` - 邮件服务

## 🔄 开发工作流

### 1️⃣ B2C 特有功能开发

```bash
# 1. 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/b2c-payment-method-selector

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交更改
git add .
git commit -m "feat(b2c): add payment method selector"

# 4. 推送到远程
git push origin feature/b2c-payment-method-selector

# 5. 创建 Pull Request 到 main
# 在 GitHub 上创建 PR: feature/b2c-payment-method-selector -> main

# 6. 代码审查通过后合并
# 审查通过后在 GitHub 上合并

# 7. 清理本地分支
git checkout main
git pull origin main
git branch -d feature/b2c-payment-method-selector
```

### 2️⃣ B2B 特有功能开发

```bash
# 1. 创建功能分支
git checkout b2b-main
git pull origin b2b-main
git checkout -b feature/b2b-quote-approval-workflow

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交更改
git add .
git commit -m "feat(b2b): add quote approval workflow"

# 4. 推送到远程
git push origin feature/b2b-quote-approval-workflow

# 5. 创建 Pull Request 到 b2b-main
# 在 GitHub 上创建 PR: feature/b2b-quote-approval-workflow -> b2b-main

# 6. 代码审查通过后合并
# 审查通过后在 GitHub 上合并

# 7. 清理本地分支
git checkout b2b-main
git pull origin b2b-main
git branch -d feature/b2b-quote-approval-workflow
```

### 3️⃣ 共享功能开发

```bash
# 1. 创建共享功能分支（从共同祖先）
git checkout 040b23f7aba44f1682762c863a2e34019a9d532e
git checkout -b feature/shared-product-search-optimization

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交更改
git add .
git commit -m "feat(shared): optimize product search algorithm"

# 4. 推送到远程
git push origin feature/shared-product-search-optimization

# 5. 合并到 B2B 主分支
git checkout b2b-main
git pull origin b2b-main
git merge feature/shared-product-search-optimization
# 解决可能的冲突
git push origin b2b-main

# 6. 合并到 B2C 主分支
git checkout main
git pull origin main
git merge feature/shared-product-search-optimization
# 解决可能的冲突
git push origin main

# 7. 清理分支
git branch -d feature/shared-product-search-optimization
git push origin --delete feature/shared-product-search-optimization
```

## 🚨 热修复工作流

### B2C 热修复
```bash
git checkout main
git checkout -b hotfix/b2c-payment-error-handling
# 修复 bug
git commit -m "fix(b2c): fix payment error handling"
git push origin hotfix/b2c-payment-error-handling
# 创建 PR 并快速合并
```

### B2B 热修复
```bash
git checkout b2b-main
git checkout -b hotfix/b2b-quote-email-bug
# 修复 bug
git commit -m "fix(b2b): fix quote email sending issue"
git push origin hotfix/b2b-quote-email-bug
# 创建 PR 并快速合并
```

## 📦 发布流程

### B2C 发布
```bash
git checkout main
git pull origin main
git checkout -b release/b2c-v1.2.0
# 更新版本号、生成 changelog 等
git commit -m "chore(b2c): prepare release v1.2.0"
git push origin release/b2c-v1.2.0
# 创建 PR 合并到 main
# 合并后打 tag
git tag -a b2c-v1.2.0 -m "B2C Release v1.2.0"
git push origin b2c-v1.2.0
```

### B2B 发布
```bash
git checkout b2b-main
git pull origin b2b-main
git checkout -b release/b2b-v1.1.0
# 更新版本号、生成 changelog 等
git commit -m "chore(b2b): prepare release v1.1.0"
git push origin release/b2b-v1.1.0
# 创建 PR 合并到 b2b-main
# 合并后打 tag
git tag -a b2b-v1.1.0 -m "B2B Release v1.1.0"
git push origin b2b-v1.1.0
```

## 🛡️ 分支保护规则

### `main` 分支保护
- ✅ 要求 Pull Request 审查
- ✅ 要求至少 1 个审查者批准
- ✅ 要求 CI 检查通过
- ✅ 要求分支保持最新
- ❌ 禁止强制推送
- ❌ 禁止删除分支

### `b2b-main` 分支保护
- ✅ 要求 Pull Request 审查
- ✅ 要求至少 1 个审查者批准
- ✅ 要求 CI 检查通过
- ✅ 要求分支保持最新
- ❌ 禁止强制推送
- ❌ 禁止删除分支

## 📝 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### Scope 范围
- `b2c`: B2C 系统特有功能
- `b2b`: B2B 系统特有功能
- `shared`: 共享功能
- `payment`: 支付相关
- `cart`: 购物车相关
- `quote`: 询价相关
- `admin`: 管理后台
- `api`: API 接口
- `ui`: UI 组件

### 示例
```bash
# B2C 功能
git commit -m "feat(b2c): add stripe payment integration"
git commit -m "fix(b2c): fix shopping cart quantity update issue"

# B2B 功能
git commit -m "feat(b2b): add bulk quote request feature"
git commit -m "fix(b2b): fix quote email notification bug"

# 共享功能
git commit -m "feat(shared): improve product search performance"
git commit -m "refactor(shared): optimize database queries"
```

## 🔍 功能判断指南

### B2C 特有功能（仅在 main 分支）
- 💳 支付处理（Stripe 集成）
- 🛒 购物车系统
- 💰 即时结账
- 💵 在线支付
- ⭐ 产品评论
- ❤️ 愿望清单
- 🎁 优惠券系统
- 📧 订单确认邮件

### B2B 特有功能（仅在 b2b-main 分支）
- 📋 询价系统
- 📦 批量订购
- 💼 定制报价
- 🤝 客户管理
- 📊 采购订单
- 📈 客户门户
- 🔐 多级审批流程
- 📑 合同管理

### 共享功能（两个分支都有）
- 🏷️ 产品目录
- 🔍 产品搜索
- 📱 响应式界面
- 👤 用户认证
- 🔒 权限管理
- 📰 博客系统
- 📞 联系表单
- 📧 邮件服务
- 🎨 UI 组件
- 🛠️ 管理后台基础功能

## 🗄️ 数据库管理

### B2C 数据库
```bash
# 端口: 5434
# 数据库名: b2c_business
# 容器名: b2c_postgres

# 启动 B2C 数据库
cd /path/to/b2c_project
docker-compose up -d

# 运行迁移
pnpm prisma migrate dev

# 查看数据
pnpm prisma studio
```

### B2B 数据库
```bash
# 端口: 5433
# 数据库名: b2b_business
# 容器名: b2b_postgres

# 启动 B2B 数据库
cd /path/to/b2b_project
git checkout b2b-main
docker-compose up -d

# 运行迁移
pnpm prisma migrate dev

# 查看数据
pnpm prisma studio
```

## 🚀 部署策略

### B2C 部署
- **环境**: Production B2C
- **域名**: `www.b2c-business.com`
- **分支**: `main`
- **数据库**: B2C 生产数据库
- **环境变量**: `.env.b2c.production`

### B2B 部署
- **环境**: Production B2B
- **域名**: `www.b2b-business.com`
- **分支**: `b2b-main`
- **数据库**: B2B 生产数据库
- **环境变量**: `.env.b2b.production`

## ⚠️ 重要注意事项

### 1. 数据库分离
- B2C 和 B2B 必须使用**完全独立**的数据库
- 不同的端口，不同的数据库名称
- 避免数据混淆和安全问题

### 2. 环境变量隔离
- 使用不同的 `.env` 文件
- B2C 包含 Stripe 密钥
- B2B 不包含支付相关配置

### 3. 定期同步
- 每周至少一次将共享功能同步到两个分支
- 使用 `git merge` 而不是 `git rebase`
- 及时解决合并冲突

### 4. 代码审查
- 所有 PR 必须经过代码审查
- B2C 功能不能合并到 b2b-main
- B2B 功能不能合并到 main
- 共享功能需要在两个分支都测试

### 5. 版本管理
- 使用独立的版本号
- B2C: `b2c-vX.Y.Z`
- B2B: `b2b-vX.Y.Z`
- 共享功能更新两个系统版本号

## 📚 参考资源

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 🆘 常见问题

### Q: 如何判断一个功能是 B2C、B2B 还是共享？
**A**: 参考上面的"功能判断指南"。如果不确定，先在共享分支开发，后续可以调整。

### Q: 共享功能合并冲突怎么办？
**A**: 优先解决 b2b-main 的冲突，然后再解决 main 的冲突。必要时可以手动调整。

### Q: 可以直接在主分支开发吗？
**A**: 不可以！必须创建功能分支，通过 PR 合并。

### Q: 热修复需要审查吗？
**A**: 需要，但可以快速审查。紧急情况可以先部署，后补审查。

### Q: 如何处理依赖包更新？
**A**: 在共享功能分支更新，然后同步到两个主分支。

---

**最后更新**: 2025年10月
**维护者**: 开发团队
**版本**: 1.0.0

