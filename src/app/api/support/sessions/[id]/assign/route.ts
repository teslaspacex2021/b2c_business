import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { assignedTo } = await request.json();
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!assignedTo) {
      return NextResponse.json(
        { success: false, error: 'Assigned user ID is required' },
        { status: 400 }
      );
    }

    // 更新会话分配
    const updatedSession = await prisma.supportSession.update({
      where: { id: sessionId },
      data: {
        assignedTo,
        status: 'ACTIVE',
        assignedAt: new Date()
      },
      include: {
        user: true,
        customer: true,
        assignedUser: true
      }
    });

    // 创建系统消息
    await prisma.supportMessage.create({
      data: {
        sessionId,
        content: `Session has been assigned to support agent`,
        messageType: 'SYSTEM',
        senderType: 'SYSTEM'
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error assigning session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign session' },
      { status: 500 }
    );
  }
}
