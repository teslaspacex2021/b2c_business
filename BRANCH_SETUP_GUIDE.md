# 分支设置完成指南

## ✅ 已完成的工作

1. ✅ **main 分支 (B2C 系统)** 已配置并推送
   - 项目名称: `b2c_business`
   - 数据库: `b2c_business` (端口 5434)
   - 功能: 包含 Stripe 支付、购物车等 B2C 功能
   - 提交: `940f43d` - "chore(b2c): configure B2C system with Stripe payment"
   - 状态: ✅ 已推送到 GitHub

2. ✅ **b2b-main 分支 (B2B 系统)** 已配置（待推送）
   - 项目名称: `b2b_business`
   - 数据库: `b2b_business` (端口 5433)
   - 功能: 专注询价、报价，无支付功能
   - 基础提交: `040b23f7` (无支付功能版本)
   - 提交: `1702ebb` - "chore(b2b): configure B2B system without payment features"
   - 状态: ⏳ 本地已创建，待推送

3. ✅ **系统配置文件** 已创建
   - `src/config/system-type.ts` (两个分支都有)
   - `.env.example` (提供了示例配置)

4. ✅ **分支管理文档** 已创建
   - `BRANCHING_STRATEGY.md` (详细的分支策略)
   - `README.md` 已更新（两个分支分别更新）

## 🔄 待完成的工作

### 1. 推送 b2b-main 分支到 GitHub

由于网络连接问题，`b2b-main` 分支还未推送到 GitHub。请执行以下命令：

```bash
# 确保在项目目录
cd /Users/coinbase2023/Desktop/product/b2b_business

# 切换到 b2b-main 分支（如果不在的话）
git checkout b2b-main

# 推送到 GitHub
git push origin b2b-main

# 推送成功后，你应该看到类似的输出：
# To https://github.com/teslaspacex2021/b2b_business.git
#  * [new branch]      b2b-main -> b2b-main
```

### 2. 在 GitHub 上设置分支保护规则

#### 2.1 保护 main 分支 (B2C)

1. 访问 GitHub 仓库: https://github.com/teslaspacex2021/b2b_business
2. 点击 **Settings** > **Branches**
3. 点击 **Add branch protection rule**
4. 配置如下：

```
Branch name pattern: main

☑️ Require a pull request before merging
   ☑️ Require approvals (1)
   ☑️ Dismiss stale pull request approvals when new commits are pushed
   
☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   
☑️ Require conversation resolution before merging

☑️ Do not allow bypassing the above settings

☐ Allow force pushes (取消勾选)
☐ Allow deletions (取消勾选)
```

5. 点击 **Create** 保存

#### 2.2 保护 b2b-main 分支 (B2B)

使用与 main 分支相同的配置，但分支名称改为 `b2b-main`：

```
Branch name pattern: b2b-main

☑️ Require a pull request before merging
   ☑️ Require approvals (1)
   ☑️ Dismiss stale pull request approvals when new commits are pushed
   
☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   
☑️ Require conversation resolution before merging

☑️ Do not allow bypassing the above settings

☐ Allow force pushes (取消勾选)
☐ Allow deletions (取消勾选)
```

### 3. 更新 GitHub 仓库描述

建议更新仓库描述以反映双系统架构：

1. 访问仓库主页
2. 点击 **Settings**
3. 在 **Repository name** 下方的 **Description** 中填写：

```
B2B/B2C Business Platform - Dual-branch architecture (main: B2C with payments | b2b-main: B2B with quotes)
```

4. 添加 **Topics** (标签):
   - `nextjs`
   - `typescript`
   - `b2b`
   - `b2c`
   - `stripe`
   - `postgresql`
   - `prisma`
   - `dual-branch`

### 4. 创建分支说明文件（在 GitHub 上）

在 GitHub 仓库主页创建或更新 **Repository Description** 区域的内容：

1. 点击仓库主页右上角的 ⚙️ (Settings)
2. 在 **About** 部分添加：

```
🌐 Website: https://your-b2c-site.com (B2C) | https://your-b2b-site.com (B2B)

📋 Description:
Dual-branch Next.js platform supporting both B2B and B2C business models.

🔀 Branches:
• main - B2C system with Stripe payments
• b2b-main - B2B system with quotations

📖 Documentation: See BRANCHING_STRATEGY.md
```

## 📊 分支架构概览

```
Repository: teslaspacex2021/b2b_business
├── main (B2C) ✅ 已推送
│   ├── Features: 支付、购物车、订单
│   ├── Port: 5434
│   └── Database: b2c_business
│
└── b2b-main (B2B) ⏳ 待推送
    ├── Features: 询价、报价、批量订购
    ├── Port: 5433
    └── Database: b2b_business
```

## 🔍 验证步骤

### 验证 main 分支 (B2C)

```bash
git checkout main
git pull origin main

# 检查配置
cat package.json | grep "name"
# 输出应为: "name": "b2c_business"

cat docker-compose.yml | grep "5434"
# 应该找到端口配置

cat docker-compose.yml | grep "b2c"
# 应该找到 b2c 相关配置
```

### 验证 b2b-main 分支 (B2B)

```bash
git checkout b2b-main
git pull origin b2b-main  # 推送后执行

# 检查配置
cat package.json | grep "name"
# 输出应为: "name": "b2b_business"

cat docker-compose.yml | grep "5433"
# 应该找到端口配置

cat docker-compose.yml | grep "b2b"
# 应该找到 b2b 相关配置
```

## 🚀 下一步开发指南

### 开发 B2C 功能

```bash
# 1. 切换到 main 分支
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/b2c-new-feature

# 3. 开发完成后
git add .
git commit -m "feat(b2c): add new feature"
git push origin feature/b2c-new-feature

# 4. 在 GitHub 创建 PR 到 main
```

### 开发 B2B 功能

```bash
# 1. 切换到 b2b-main 分支
git checkout b2b-main
git pull origin b2b-main

# 2. 创建功能分支
git checkout -b feature/b2b-new-feature

# 3. 开发完成后
git add .
git commit -m "feat(b2b): add new feature"
git push origin feature/b2b-new-feature

# 4. 在 GitHub 创建 PR 到 b2b-main
```

### 开发共享功能

```bash
# 1. 从共同祖先创建分支
git checkout 040b23f7aba44f1682762c863a2e34019a9d532e
git checkout -b feature/shared-new-feature

# 2. 开发完成后
git add .
git commit -m "feat(shared): add shared feature"
git push origin feature/shared-new-feature

# 3. 合并到两个主分支
git checkout b2b-main
git merge feature/shared-new-feature
git push origin b2b-main

git checkout main
git merge feature/shared-new-feature
git push origin main
```

## 🗄️ 数据库管理

### 启动 B2C 数据库

```bash
cd /Users/coinbase2023/Desktop/product/b2b_business
git checkout main

# 停止所有 Docker 容器
docker-compose down

# 启动 B2C 数据库 (端口 5434)
docker-compose up -d

# 运行迁移
pnpm prisma migrate dev

# 填充数据
pnpm prisma:seed
```

### 启动 B2B 数据库

```bash
cd /Users/coinbase2023/Desktop/product/b2b_business
git checkout b2b-main

# 停止所有 Docker 容器
docker-compose down

# 启动 B2B 数据库 (端口 5433)
docker-compose up -d

# 运行迁移
pnpm prisma migrate dev

# 填充数据
pnpm prisma:seed
```

## ⚠️ 重要提醒

1. **数据库隔离**: 两个系统使用不同的数据库和端口，确保数据完全隔离
2. **环境变量**: 切换分支时，记得更新 `.env` 文件中的 `DATABASE_URL`
3. **端口管理**: 
   - B2B: 5433
   - B2C: 5434
   - 应用: 3000 (两者共用，但不能同时运行)
4. **分支切换**: 切换分支前，确保停止开发服务器和数据库容器
5. **提交规范**: 使用 `feat(b2c):` 或 `feat(b2b):` 前缀标识功能所属系统

## 📞 常见问题

### Q: 如何同时开发两个系统？

A: 建议使用两个不同的项目目录：

```bash
# 克隆两次到不同目录
git clone https://github.com/teslaspacex2021/b2b_business.git b2c_project
git clone https://github.com/teslaspacex2021/b2b_business.git b2b_project

# B2C 项目
cd b2c_project
git checkout main
# 在端口 3000 开发

# B2B 项目
cd b2b_project
git checkout b2b-main
# 在端口 3001 开发 (修改 package.json 中的 dev 命令)
```

### Q: 如何知道当前在哪个系统？

A: 检查以下内容：

```bash
# 查看当前分支
git branch --show-current

# 查看系统配置
cat src/config/system-type.ts | grep "type:"

# 查看项目名称
cat package.json | grep "name"

# 查看数据库端口
cat docker-compose.yml | grep "543"
```

### Q: 可以在 main 分支开发 B2B 功能吗？

A: 不可以！严格遵守分支职责：
- `main` 分支只用于 B2C 特有功能
- `b2b-main` 分支只用于 B2B 特有功能
- 共享功能从共同祖先分支开发，然后合并到两个主分支

## 📚 参考文档

- [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) - 详细的分支管理策略
- [README.md](./README.md) - 项目说明（两个分支内容不同）
- [.env.example](./.env.example) - 环境变量示例（两个分支内容不同）

## ✅ 完成检查清单

完成以下步骤后，分支架构就完全设置好了：

- [x] main 分支已配置 B2C 系统
- [x] main 分支已推送到 GitHub
- [x] b2b-main 分支已创建
- [x] b2b-main 分支已配置 B2B 系统
- [ ] b2b-main 分支已推送到 GitHub ⏳
- [ ] main 分支设置了保护规则 ⏳
- [ ] b2b-main 分支设置了保护规则 ⏳
- [ ] GitHub 仓库描述已更新 ⏳

---

**创建时间**: 2025年10月15日  
**状态**: 主要工作已完成，待完成推送和保护规则设置  
**优先级**: 高 - 请尽快完成待办事项

