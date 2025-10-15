import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取客户互动记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { customerId: id };
    if (type) where.type = type;
    if (status) where.status = status;

    const interactions = await prisma.customerInteraction.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.customerInteraction.count({ where });

    return NextResponse.json({
      interactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新的互动记录
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await params;
    const body = await request.json();

    const {
      type,
      subject,
      content,
      channel = 'EMAIL',
      status = 'COMPLETED',
      priority = 'NORMAL',
      scheduledAt,
      completedAt,
      attachments = [],
      relatedQuoteId
    } = body;

    if (!type || !subject || !content) {
      return NextResponse.json(
        { error: 'Type, subject, and content are required' },
        { status: 400 }
      );
    }

    // 检查客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const interaction = await prisma.customerInteraction.create({
      data: {
        customerId,
        type,
        subject,
        content,
        channel,
        status,
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : (status === 'COMPLETED' ? new Date() : null),
        attachments,
        relatedQuoteId,
        createdBy: user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(interaction, { status: 201 });

  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
