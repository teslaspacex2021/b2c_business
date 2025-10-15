// 权限管理工具函数

export type Role = 'ADMIN' | 'EDITOR' | 'USER';

// 权限级别定义（数字越大权限越高）
export const ROLE_LEVELS: Record<Role, number> = {
  USER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

// 权限描述
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: '管理员 - 拥有所有权限，包括用户管理和系统设置',
  EDITOR: '编辑 - 可以管理内容，包括产品、博客、页面等',
  USER: '普通用户 - 前端网站用户',
};

// 权限检查函数
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

// 检查是否可以管理指定角色的用户
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  // 管理员可以管理所有人
  if (managerRole === 'ADMIN') return true;
  
  // 编辑不能管理其他用户
  return false;
}

// 获取用户可以分配的角色列表
export function getAssignableRoles(userRole: Role): Role[] {
  const allRoles: Role[] = ['USER', 'EDITOR', 'ADMIN'];
  
  return allRoles.filter(role => {
    // 管理员可以分配所有角色
    if (userRole === 'ADMIN') return true;
    
    // 编辑不能分配角色
    return false;
  });
}

// 权限功能映射
export const PERMISSIONS = {
  // 用户管理
  MANAGE_USERS: ['ADMIN'],
  
  // 内容管理
  MANAGE_PRODUCTS: ['ADMIN', 'EDITOR'],
  MANAGE_BLOGS: ['ADMIN', 'EDITOR'],
  MANAGE_PAGES: ['ADMIN', 'EDITOR'],
  MANAGE_CATEGORIES: ['ADMIN', 'EDITOR'],
  MANAGE_CONTACTS: ['ADMIN', 'EDITOR'],
  
  // 系统设置
  MANAGE_SITE_CONFIG: ['ADMIN'],
  MANAGE_SOCIAL_MEDIA: ['ADMIN'],
  MANAGE_SETTINGS: ['ADMIN'],
  MANAGE_EMAIL_TEMPLATES: ['ADMIN'],
  MANAGE_BACKUPS: ['ADMIN'],
  
  // 查看权限
  VIEW_ANALYTICS: ['ADMIN', 'EDITOR'],
} as const;

// 检查用户是否有特定功能权限
export function hasFeaturePermission(userRole: Role, feature: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[feature].includes(userRole as any);
}

// 获取角色颜色（用于UI显示）
export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: 'bg-red-600 text-white',
    EDITOR: 'bg-blue-600 text-white',
    USER: 'bg-gray-600 text-white',
  };
  return colors[role];
}

// 获取角色图标
export function getRoleIcon(role: Role): string {
  const icons: Record<Role, string> = {
    ADMIN: '🛡️',
    EDITOR: '✏️',
    USER: '👤',
  };
  return icons[role];
}
