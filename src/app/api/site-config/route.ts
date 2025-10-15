import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 获取网站配置（公共API）
export async function GET() {
  try {
    // 获取第一个（也是唯一的）网站配置记录
    const siteConfig = await prisma.siteConfig.findFirst();
    
    if (!siteConfig) {
      return NextResponse.json(
        { error: 'Site configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ siteConfig });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
