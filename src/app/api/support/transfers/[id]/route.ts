import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 更新转接状态的请求体验证
const updateTransferSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  notes: z.string().optional(),
});

// GET - 获取转接详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transfer = await prisma.supportTransfer.findUnique({
      where: { id: params.id },
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
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: 'Transfer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    console.error('Error fetching support transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transfer' },
      { status: 500 }
    );
  }
}

// PUT - 更新转接状态
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateTransferSchema.parse(body);

    // 检查转接是否存在
    const existingTransfer = await prisma.supportTransfer.findUnique({
      where: { id: params.id },
      include: {
        session: true,
        fromUser: {
          select: { id: true, name: true }
        },
        toUser: {
          select: { id: true, name: true }
        }
      }
    });

    if (!existingTransfer) {
      return NextResponse.json(
        { success: false, error: 'Transfer not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = { ...validatedData };

    // 根据状态设置时间戳
    if (validatedData.status === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
    } else if (validatedData.status === 'REJECTED') {
      updateData.rejectedAt = new Date();
    }

    // 更新转接记录
    const transfer = await prisma.supportTransfer.update({
      where: { id: params.id },
      data: updateData,
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

    // 如果转接被接受，更新会话分配
    if (validatedData.status === 'ACCEPTED') {
      await prisma.supportSession.update({
        where: { id: existingTransfer.sessionId },
        data: {
          assignedTo: existingTransfer.toUserId,
          assignedAt: new Date(),
          status: 'ACTIVE'
        }
      });

      // 创建转接成功消息
      await prisma.supportMessage.create({
        data: {
          sessionId: existingTransfer.sessionId,
          content: `Session transferred successfully to ${existingTransfer.toUser.name}`,
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          status: 'SENT'
        }
      });
    } else if (validatedData.status === 'REJECTED') {
      // 创建转接拒绝消息
      await prisma.supportMessage.create({
        data: {
          sessionId: existingTransfer.sessionId,
          content: `Transfer request rejected by ${existingTransfer.toUser.name}${validatedData.notes ? ` (Reason: ${validatedData.notes})` : ''}`,
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          status: 'SENT'
        }
      });
    } else if (validatedData.status === 'CANCELLED') {
      // 创建转接取消消息
      await prisma.supportMessage.create({
        data: {
          sessionId: existingTransfer.sessionId,
          content: 'Transfer request has been cancelled',
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          status: 'SENT'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    console.error('Error updating support transfer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update transfer' },
      { status: 500 }
    );
  }
}
