import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - 获取所有活跃的社媒账号（公共接口）
export async function GET() {
  try {
    const socialMedias = await prisma.socialMedia.findMany({
      select: {
        id: true,
        platform: true,
        name: true,
        url: true,
        icon: true,
        description: true,
        active: true,
        showInHeader: true,
        showInFooter: true,
        sortOrder: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // 过滤活跃的社媒账号
    const activeSocialMedias = socialMedias.filter(item => item.active && item.url);

    return NextResponse.json({
      success: true,
      data: activeSocialMedias
    });
  } catch (error) {
    console.error('获取社媒账号失败:', error);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: '获取社媒账号失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
