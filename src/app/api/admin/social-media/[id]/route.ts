import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/auth-middleware';

// 社媒账号数据验证schema
const socialMediaUpdateSchema = z.object({
  platform: z.string().min(1, '平台名称不能为空').optional(),
  name: z.string().min(1, '显示名称不能为空').optional(),
  url: z.string().optional(), // 移除URL验证，允许任意字符串（如微信ID）
  icon: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  showInHeader: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// GET - 获取单个社媒账号
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查社媒管理权限
    const permissionError = await checkPermission(request, 'MANAGE_SOCIAL_MEDIA');
    if (permissionError) return permissionError;

    const { id } = await params;
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id }
    });

    if (!socialMedia) {
      return NextResponse.json(
        { error: '社媒账号不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: socialMedia
    });
  } catch (error) {
    console.error('获取社媒账号失败:', error);
    return NextResponse.json(
      { error: '获取社媒账号失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新社媒账号
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查社媒管理权限
    const permissionError = await checkPermission(request, 'MANAGE_SOCIAL_MEDIA');
    if (permissionError) return permissionError;

    const { id } = await params;
    const body = await request.json();
    const validatedData = socialMediaUpdateSchema.parse(body);

    // 检查社媒账号是否存在
    const existingSocialMedia = await prisma.socialMedia.findUnique({
      where: { id }
    });

    if (!existingSocialMedia) {
      return NextResponse.json(
        { error: '社媒账号不存在' },
        { status: 404 }
      );
    }

    // 如果更新平台名称，检查是否与其他账号冲突
    if (validatedData.platform && validatedData.platform !== existingSocialMedia.platform) {
      const platformExists = await prisma.socialMedia.findUnique({
        where: { platform: validatedData.platform }
      });

      if (platformExists) {
        return NextResponse.json(
          { error: '该平台已存在' },
          { status: 400 }
        );
      }
    }

    const socialMedia = await prisma.socialMedia.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: socialMedia
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }

    console.error('更新社媒账号失败:', error);
    return NextResponse.json(
      { error: '更新社媒账号失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除社媒账号
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查社媒管理权限
    const permissionError = await checkPermission(request, 'MANAGE_SOCIAL_MEDIA');
    if (permissionError) return permissionError;

    const { id } = await params;
    
    // 检查社媒账号是否存在
    const existingSocialMedia = await prisma.socialMedia.findUnique({
      where: { id }
    });

    if (!existingSocialMedia) {
      return NextResponse.json(
        { error: '社媒账号不存在' },
        { status: 404 }
      );
    }

    await prisma.socialMedia.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '社媒账号删除成功'
    });
  } catch (error) {
    console.error('删除社媒账号失败:', error);
    return NextResponse.json(
      { error: '删除社媒账号失败' },
      { status: 500 }
    );
  }
}
