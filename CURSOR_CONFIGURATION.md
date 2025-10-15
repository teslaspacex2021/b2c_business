# Cursor IDE Configuration for B2B Business Platform

## 📋 配置概述

本文档描述了为B2B Business平台配置的Cursor IDE规则和设置。

## 🔧 配置文件

### 1. `.cursorrules` - 主要规则文件
包含完整的开发指导原则，涵盖：

#### 技术栈规范
- **框架**: Next.js 15.1.0 with Turbopack
- **语言**: TypeScript 5 (严格模式)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js v4
- **支付**: Stripe集成
- **样式**: Tailwind CSS + shadcn/ui
- **表单**: React Hook Form + Zod验证

#### 代码规范
- 文件命名约定 (kebab-case, PascalCase)
- 导入组织规则
- TypeScript最佳实践
- React组件模式
- API开发规范

#### 安全规范
- 认证和授权
- 数据验证
- API安全
- 支付安全

#### 性能优化
- Next.js优化策略
- 数据库查询优化
- 前端性能优化

### 2. `.cursorignore` - 忽略文件配置
配置了应该被AI助手忽略的文件和目录：

- 依赖目录 (`node_modules/`, `.pnpm-store/`)
- 构建输出 (`.next/`, `out/`, `dist/`)
- 环境变量文件 (`.env*`)
- 日志文件 (`*.log`)
- 测试文件 (`test-screenshots/`, `test-results/`)
- 编辑器配置 (`.vscode/`, `.idea/`)
- 系统文件 (`.DS_Store`)

### 3. `.cursor/mcp.json` - MCP服务器配置
配置了shadcn MCP服务器，用于组件管理。

## 🎯 使用效果

### AI助手改进
配置后，Cursor的AI助手将：

1. **理解项目结构**: 知道这是一个B2B贸易平台
2. **遵循技术栈**: 使用Next.js 15、TypeScript、Prisma等
3. **应用最佳实践**: 安全、性能、可维护性
4. **生成规范代码**: 符合项目约定的代码风格
5. **考虑业务场景**: B2B贸易、国际化、企业级需求

### 代码质量提升
- **类型安全**: 严格的TypeScript类型检查
- **错误处理**: 完善的错误边界和异常处理
- **性能优化**: 服务器组件优先、适当的缓存策略
- **安全性**: 认证、授权、数据验证
- **可维护性**: 清晰的代码结构和文档

## 🚀 开发工作流

### 1. 组件开发
```typescript
// AI助手会生成符合规范的组件
interface ComponentProps {
  // 正确的类型定义
}

export default function Component({ ...props }: ComponentProps) {
  // 遵循React最佳实践
  return (
    // 使用shadcn/ui组件
  );
}
```

### 2. API开发
```typescript
// AI助手会生成标准的API路由
export async function GET(request: NextRequest) {
  try {
    // 认证检查
    // 数据验证
    // 错误处理
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. 数据库操作
```typescript
// AI助手会使用Prisma最佳实践
const data = await prisma.model.findMany({
  where: { /* 条件 */ },
  include: { /* 关联 */ },
  orderBy: { /* 排序 */ },
});
```

## 📈 配置优势

### 1. 开发效率提升
- 减少重复性工作
- 自动应用最佳实践
- 快速生成规范代码

### 2. 代码质量保证
- 统一的代码风格
- 完善的错误处理
- 安全性考虑

### 3. 团队协作改善
- 一致的开发规范
- 清晰的项目结构
- 标准化的实现模式

### 4. 维护性增强
- 自文档化的代码
- 模块化的架构
- 易于扩展的设计

## 🔄 配置更新

### 何时更新配置
- 技术栈升级时
- 新的最佳实践出现时
- 项目需求变化时
- 团队规范调整时

### 更新流程
1. 修改 `.cursorrules` 文件
2. 更新 `.cursorignore` 如需要
3. 重启Cursor IDE
4. 验证配置生效
5. 通知团队成员

## 🎯 最佳实践建议

### 1. 定期审查
- 每月检查配置是否需要更新
- 根据项目发展调整规则
- 收集团队反馈

### 2. 版本控制
- 将配置文件纳入Git管理
- 记录重要变更
- 保持配置同步

### 3. 团队培训
- 确保团队了解配置规则
- 定期分享最佳实践
- 建立代码审查流程

## 📚 相关资源

- [Next.js 15 文档](https://nextjs.org/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 🎉 总结

通过这套完整的Cursor配置，您的B2B Business平台开发将更加高效、规范和安全。AI助手将成为您的得力助手，帮助您快速构建高质量的企业级应用。

配置已针对您的具体项目需求进行优化，包括国际贸易业务场景、Stripe支付集成、多语言支持等特殊要求。
