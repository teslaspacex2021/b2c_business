import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 更新会话的请求体验证
const updateSessionSchema = z.object({
  status: z.enum(['WAITING', 'ACTIVE', 'TRANSFERRED', 'CLOSED', 'ABANDONED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
  subject: z.string().optional(),
  department: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

// GET - 获取单个会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.supportSession.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            session: {
              select: { id: true }
            }
          }
        },
        transfers: {
          orderBy: { createdAt: 'desc' },
          include: {
            fromUser: {
              select: { id: true, name: true, email: true }
            },
            toUser: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching support session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT - 更新会话
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // 检查会话是否存在
    const existingSession = await prisma.supportSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = { ...validatedData };

    // 如果状态变为CLOSED，设置结束时间
    if (validatedData.status === 'CLOSED' && existingSession.status !== 'CLOSED') {
      updateData.endedAt = new Date();
    }

    // 如果分配了新的客服，设置分配时间
    if (validatedData.assignedTo && validatedData.assignedTo !== existingSession.assignedTo) {
      updateData.assignedAt = new Date();
    }

    const session = await prisma.supportSession.update({
      where: { id: id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // 如果状态发生变化，创建系统消息
    if (validatedData.status && validatedData.status !== existingSession.status) {
      let systemMessage = '';
      switch (validatedData.status) {
        case 'ACTIVE':
          systemMessage = 'Session is now active';
          break;
        case 'CLOSED':
          systemMessage = 'Session has been closed';
          break;
        case 'TRANSFERRED':
          systemMessage = 'Session has been transferred';
          break;
        default:
          systemMessage = `Session status changed to ${validatedData.status}`;
      }

      await prisma.supportMessage.create({
        data: {
          sessionId: id,
          content: systemMessage,
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          status: 'SENT'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error updating support session:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - 删除会话（软删除，实际上是关闭）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.supportSession.update({
      where: { id },
      data: {
        status: 'CLOSED',
        endedAt: new Date()
      }
    });

    // 创建关闭消息
    await prisma.supportMessage.create({
      data: {
        sessionId: id,
        content: 'Session has been closed by administrator',
        messageType: 'SYSTEM',
        senderType: 'SYSTEM',
        status: 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error deleting support session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
