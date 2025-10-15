import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

// 获取系统配置
export async function GET(request: NextRequest) {
  try {
    // 检查管理员权限
    const permissionError = await checkPermission(request, 'MANAGE_SETTINGS');
    if (permissionError) return permissionError;

    let systemConfig = await prisma.systemConfig.findFirst();
    
    if (!systemConfig) {
      // 创建默认配置
      systemConfig = await prisma.systemConfig.create({
        data: {}
      });
    }

    // 不返回敏感信息
    const { emailPassword, ...safeConfig } = systemConfig;

    return NextResponse.json({ 
      systemConfig: {
        ...safeConfig,
        emailPassword: emailPassword ? '••••••••' : ''
      }
    });
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新系统配置
export async function PUT(request: NextRequest) {
  try {
    // 检查管理员权限
    const permissionError = await checkPermission(request, 'MANAGE_SETTINGS');
    if (permissionError) return permissionError;

    const body = await request.json();
    
    // 处理邮件密码加密
    if (body.emailPassword && body.emailPassword !== '••••••••') {
      body.emailPassword = await bcrypt.hash(body.emailPassword, 10);
    } else if (body.emailPassword === '••••••••') {
      // 如果密码没有改变，删除这个字段
      delete body.emailPassword;
    }

    // 获取现有配置或创建新配置
    let systemConfig = await prisma.systemConfig.findFirst();
    
    if (!systemConfig) {
      // 创建新配置
      systemConfig = await prisma.systemConfig.create({
        data: body
      });
    } else {
      // 更新现有配置
      systemConfig = await prisma.systemConfig.update({
        where: { id: systemConfig.id },
        data: body
      });
    }

    // 不返回敏感信息
    const { emailPassword, ...safeConfig } = systemConfig;

    return NextResponse.json({ 
      message: 'System configuration updated successfully', 
      systemConfig: {
        ...safeConfig,
        emailPassword: emailPassword ? '••••••••' : ''
      }
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
