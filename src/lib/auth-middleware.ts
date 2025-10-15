import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasFeaturePermission, Role, PERMISSIONS } from '@/lib/permissions';

// 权限检查中间件
export async function checkPermission(
  request: NextRequest,
  requiredPermission: keyof typeof PERMISSIONS
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    
    if (!hasFeaturePermission(userRole, requiredPermission)) {
      return NextResponse.json({ 
        error: '权限不足', 
        required: requiredPermission,
        userRole 
      }, { status: 403 });
    }

    return null; // 权限检查通过
  } catch (error) {
    console.error('权限检查失败:', error);
    return NextResponse.json({ error: '权限检查失败' }, { status: 500 });
  }
}

// 管理员权限检查（兼容旧代码）
export async function checkAdminPermission(request: NextRequest) {
  return checkPermission(request, 'MANAGE_USERS');
}

// 内容管理权限检查
export async function checkContentPermission(request: NextRequest) {
  return checkPermission(request, 'MANAGE_PRODUCTS');
}

// 获取当前用户会话
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('获取用户会话失败:', error);
    return null;
  }
}
