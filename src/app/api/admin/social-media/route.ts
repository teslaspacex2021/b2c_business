import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/auth-middleware';

// 社媒账号数据验证schema
const socialMediaSchema = z.object({
  platform: z.string().min(1, '平台名称不能为空'),
  name: z.string().min(1, '显示名称不能为空'),
  url: z.string().url('请输入有效的URL'),
  icon: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// GET - 获取所有社媒账号
export async function GET(request: NextRequest) {
  try {
    // 检查社媒管理权限
    const permissionError = await checkPermission(request, 'MANAGE_SOCIAL_MEDIA');
    if (permissionError) return permissionError;

    const socialMedias = await prisma.socialMedia.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: socialMedias
    });
  } catch (error) {
    console.error('获取社媒账号失败:', error);
    return NextResponse.json(
      { error: '获取社媒账号失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的社媒账号
export async function POST(request: NextRequest) {
  try {
    // 检查社媒管理权限
    const permissionError = await checkPermission(request, 'MANAGE_SOCIAL_MEDIA');
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = socialMediaSchema.parse(body);

    // 检查平台是否已存在
    const existingPlatform = await prisma.socialMedia.findUnique({
      where: { platform: validatedData.platform }
    });

    if (existingPlatform) {
      return NextResponse.json(
        { error: '该平台已存在' },
        { status: 400 }
      );
    }

    const socialMedia = await prisma.socialMedia.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: socialMedia
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }

    console.error('创建社媒账号失败:', error);
    return NextResponse.json(
      { error: '创建社媒账号失败' },
      { status: 500 }
    );
  }
}
