import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 创建转接的请求体验证
const createTransferSchema = z.object({
  sessionId: z.string(),
  fromUserId: z.string().optional(),
  toUserId: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// 更新转接状态的请求体验证
const updateTransferSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  notes: z.string().optional(),
});

// GET - 获取转接记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    const [transfers, total] = await Promise.all([
      prisma.supportTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              subject: true,
              status: true
            }
          },
          fromUser: {
            select: { id: true, name: true, email: true }
          },
          toUser: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.supportTransfer.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching support transfers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}

// POST - 创建转接请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTransferSchema.parse(body);

    // 验证会话是否存在
    const session = await prisma.supportSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        assignedUser: {
          select: { id: true, name: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // 验证目标用户是否存在且有权限
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.toUserId },
      select: { id: true, name: true, email: true, role: true, active: true }
    });

    if (!targetUser || !targetUser.active || !['ADMIN', 'EDITOR'].includes(targetUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Target user not found or not authorized' },
        { status: 400 }
      );
    }

    // 检查是否已有待处理的转接
    const existingTransfer = await prisma.supportTransfer.findFirst({
      where: {
        sessionId: validatedData.sessionId,
        status: 'PENDING'
      }
    });

    if (existingTransfer) {
      return NextResponse.json(
        { success: false, error: 'There is already a pending transfer for this session' },
        { status: 400 }
      );
    }

    // 创建转接记录
    const transfer = await prisma.supportTransfer.create({
      data: {
        ...validatedData,
        fromUserId: validatedData.fromUserId || session.assignedTo,
        status: 'PENDING'
      },
      include: {
        session: {
          select: {
            id: true,
            sessionId: true,
            subject: true
          }
        },
        fromUser: {
          select: { id: true, name: true, email: true }
        },
        toUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // 创建转接通知消息
    const fromUserName = transfer.fromUser?.name || 'System';
    const toUserName = transfer.toUser.name;
    
    await prisma.supportMessage.create({
      data: {
        sessionId: validatedData.sessionId,
        content: `Transfer request created: ${fromUserName} → ${toUserName}${validatedData.reason ? ` (Reason: ${validatedData.reason})` : ''}`,
        messageType: 'SYSTEM',
        senderType: 'SYSTEM',
        status: 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    console.error('Error creating support transfer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}
