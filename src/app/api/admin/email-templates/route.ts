import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// 获取邮件模板列表
export async function GET(request: NextRequest) {
  try {
    // 检查邮件模板管理权限
    const permissionError = await checkPermission(request, 'MANAGE_EMAIL_TEMPLATES');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const where: any = {};
    if (active !== null) {
      where.active = active === 'true';
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新邮件模板
export async function POST(request: NextRequest) {
  try {
    // 检查邮件模板管理权限
    const permissionError = await checkPermission(request, 'MANAGE_EMAIL_TEMPLATES');
    if (permissionError) return permissionError;

    const body = await request.json();
    const { name, subject, htmlContent, textContent, variables, active } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Name, subject, and HTML content are required' },
        { status: 400 }
      );
    }

    // 检查模板名称是否已存在
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent: textContent || '',
        variables: variables || {},
        active: active !== false
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
