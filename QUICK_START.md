# 🚀 B2B Business - 快速启动指南

## 📋 启动前检查清单

### ✅ 必需软件
- [ ] Node.js (推荐 v18+)
- [ ] pnpm (包管理器)
- [ ] Docker Desktop (用于数据库)

### 🔧 启动步骤

#### 1. 启动 Docker Desktop
确保 Docker Desktop 正在运行

#### 2. 启动数据库
```bash
# 启动 PostgreSQL 数据库
pnpm run db:start

# 或者手动启动
docker-compose up -d postgres
```

#### 3. 初始化数据库
```bash
# 运行数据库迁移
pnpm run prisma:migrate

# 添加示例数据
pnpm run prisma:seed
```

#### 4. 启动开发服务器
```bash
pnpm run dev
```

## 🌐 访问地址

- **用户端网站**: http://localhost:3001
- **管理面板**: http://localhost:3001/admin
- **数据库管理**: http://localhost:5555 (运行 `pnpm run prisma:studio`)

## 🔐 登录信息

### 管理员账户
- **邮箱**: admin@b2bbusiness.com
- **密码**: password
- **权限**: 完全管理权限

### 编辑账户
- **邮箱**: editor@b2bbusiness.com
- **密码**: password
- **权限**: 内容编辑权限

## 📊 数据库信息

- **类型**: PostgreSQL 15
- **端口**: 5433 (避免与系统数据库冲突)
- **数据库名**: b2b_business
- **用户名**: postgres
- **密码**: postgres123

## 🛠️ 常用命令

```bash
# 开发相关
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 数据库相关
pnpm run db:start     # 启动数据库
pnpm run db:stop      # 停止数据库
pnpm run db:reset     # 重置数据库

# Prisma 相关
pnpm run prisma:migrate   # 运行数据库迁移
pnpm run prisma:seed      # 添加示例数据
pnpm run prisma:studio    # 打开数据库管理界面
pnpm run prisma:reset     # 重置数据库架构
```

## 🔍 故障排除

### 数据库连接问题
```bash
# 检查 Docker 是否运行
docker --version

# 检查容器状态
docker-compose ps

# 查看数据库日志
docker-compose logs postgres
```

### 端口占用问题
```bash
# 检查端口占用
lsof -i :3001  # 开发服务器
lsof -i :5433  # 数据库
```

### 重新初始化项目
```bash
# 完全重置
pnpm run db:stop
docker-compose down -v
pnpm run db:start
pnpm run prisma:migrate
pnpm run prisma:seed
```

## 📱 功能测试清单

### 用户端测试
- [ ] 访问首页 - http://localhost:3001
- [ ] 浏览产品页面 - http://localhost:3001/product
- [ ] 查看博客页面 - http://localhost:3001/blog
- [ ] 访问关于我们 - http://localhost:3001/about
- [ ] 测试联系表单 - http://localhost:3001/contact

### 管理端测试
- [ ] 登录管理面板 - http://localhost:3001/admin/login
- [ ] 查看仪表盘 - http://localhost:3001/admin
- [ ] 管理产品 - http://localhost:3001/admin/products
- [ ] 管理博客 - http://localhost:3001/admin/blogs
- [ ] 管理用户 - http://localhost:3001/admin/users
- [ ] 系统设置 - http://localhost:3001/admin/settings

## 🎯 项目特色

### ✨ 用户体验
- 响应式设计，适配手机、平板、桌面
- 现代化 UI 设计，专业商务风格
- 快速加载速度，优秀的性能表现

### 🔒 安全特性
- JWT Token 认证
- 密码加密存储
- 基于角色的权限控制
- CSRF 保护

### 🎨 技术亮点
- Next.js 15 最新特性
- React 19 并发特性
- TypeScript 类型安全
- Tailwind CSS 现代样式
- Prisma ORM 数据管理

## 📈 生产部署建议

### 环境变量
创建 `.env.production` 文件：
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-secure-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### 构建和部署
```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📞 支持

如果遇到问题，请检查：
1. 所有依赖是否正确安装
2. Docker Desktop 是否正在运行
3. 端口 3001 和 5433 是否被占用
4. 数据库是否正确初始化

---

🎉 **恭喜！您的 B2B 外贸站点已经完全搭建完成！**
