# 🗄️ Database Setup Guide

## 📋 概述

项目使用 Docker 运行 PostgreSQL 数据库，并通过 Prisma ORM 进行数据库管理。

## 🚀 快速开始

### 1. 启动数据库

```bash
# 启动 PostgreSQL 数据库
pnpm run db:start

# 或者直接使用 Docker Compose
docker-compose up -d postgres
```

### 2. 运行数据库迁移

```bash
# 创建数据库表
pnpm run prisma:migrate
```

### 3. 添加示例数据

```bash
# 运行种子脚本添加示例数据
pnpm run prisma:seed
```

## 📊 数据库信息

- **数据库类型**: PostgreSQL 15
- **端口**: 5433 (避免与系统 PostgreSQL 冲突)
- **数据库名**: b2b_business
- **用户名**: postgres
- **密码**: postgres123
- **连接URL**: `postgresql://postgres:postgres123@localhost:5433/b2b_business?schema=public`

## 🛠️ 可用命令

```bash
# 数据库管理
pnpm run db:start          # 启动数据库
pnpm run db:stop           # 停止数据库
pnpm run db:reset          # 重置数据库 (删除所有数据)

# Prisma 命令
pnpm run prisma:generate   # 生成 Prisma 客户端
pnpm run prisma:migrate    # 运行数据库迁移
pnpm run prisma:reset      # 重置数据库架构
pnpm run prisma:studio     # 打开 Prisma Studio (数据库可视化工具)
pnpm run prisma:seed       # 运行种子数据
```

## 📁 数据库架构

### Users (用户表)
- 管理员和编辑用户
- 角色权限管理
- 登录状态跟踪

### Products (产品表)
- 产品信息管理
- 分类和规格
- 发布状态控制

### BlogPosts (博客文章表)
- 文章内容管理
- SEO 优化字段
- 作者关联

### Contacts (联系表单表)
- 用户询盘管理
- 状态跟踪

## 🔧 示例数据

种子脚本会创建以下示例数据：

### 用户账户
- **管理员**: admin@b2bbusiness.com (密码: password)
- **编辑**: editor@b2bbusiness.com (密码: password)

### 产品示例
- 工业LED照明系统
- CNC加工中心
- 钢结构材料
- 电子控制系统

### 博客文章
- 2024年全球贸易趋势
- B2B贸易中的可持续制造
- 国际物流数字化转型

## 🔍 数据库管理工具

### Prisma Studio
```bash
pnpm run prisma:studio
```
在浏览器中打开 http://localhost:5555 来可视化管理数据库

### 直接连接数据库
```bash
# 使用 psql 连接
psql postgresql://postgres:postgres123@localhost:5433/b2b_business

# 或者进入 Docker 容器
docker-compose exec postgres psql -U postgres -d b2b_business
```

## 🔄 开发工作流

1. **启动开发环境**:
   ```bash
   pnpm run db:start    # 启动数据库
   pnpm run dev         # 启动开发服务器
   ```

2. **修改数据库架构**:
   - 编辑 `prisma/schema.prisma`
   - 运行 `pnpm run prisma:migrate`

3. **重置开发数据**:
   ```bash
   pnpm run prisma:reset  # 重置并运行种子数据
   ```

## 🚨 故障排除

### 端口冲突
如果 5433 端口被占用，修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "5434:5432"  # 使用不同端口
```

### 数据库连接问题
1. 确保 Docker 正在运行
2. 检查数据库容器状态: `docker-compose ps`
3. 查看容器日志: `docker-compose logs postgres`

### 权限问题
```bash
# 给脚本添加执行权限
chmod +x scripts/*.sh
```

## 📈 生产环境

在生产环境中：
1. 修改数据库密码
2. 使用环境变量管理敏感信息
3. 启用数据库备份
4. 配置数据库连接池

## 🔐 安全注意事项

- 生产环境中必须更改默认密码
- 使用强密码和安全的连接字符串
- 定期备份数据库
- 限制数据库访问权限
