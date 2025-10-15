import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取网站配置（管理员API）
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let siteConfig = await prisma.siteConfig.findFirst();
    
    if (!siteConfig) {
      siteConfig = await prisma.siteConfig.create({
        data: {}
      });
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

// 更新网站配置
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      siteName,
      siteDescription,
      logo,
      favicon,
      heroTitle,
      heroSubtitle,
      heroImage,
      heroButtonText,
      heroButtonLink,
      navigationItems,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      socialLinks,
      footerText
    } = body;

    // 获取现有配置或创建新配置
    let siteConfig = await prisma.siteConfig.findFirst();
    
    if (!siteConfig) {
      // 创建新配置
      siteConfig = await prisma.siteConfig.create({
        data: {
          siteName,
          siteDescription,
          logo,
          favicon,
          heroTitle,
          heroSubtitle,
          heroImage,
          heroButtonText,
          heroButtonLink,
          navigationItems,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          socialLinks,
          footerText
        }
      });
    } else {
      // 更新现有配置
      siteConfig = await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: {
          siteName,
          siteDescription,
          logo,
          favicon,
          heroTitle,
          heroSubtitle,
          heroImage,
          heroButtonText,
          heroButtonLink,
          navigationItems,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          socialLinks,
          footerText
        }
      });
    }

    return NextResponse.json({ 
      message: 'Site config updated successfully', 
      siteConfig 
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

