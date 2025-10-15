import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 创建会话的请求体验证
const createSessionSchema = z.object({
  visitorName: z.string().optional(),
  visitorEmail: z.string().email().optional(),
  visitorPhone: z.string().optional(),
  userId: z.string().optional(),
  customerId: z.string().optional(),
  subject: z.string().optional(),
  department: z.string().optional(),
  source: z.string().default('website'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  metadata: z.record(z.any()).optional(),
});

// GET - 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const priority = searchParams.get('priority');
    const adminView = searchParams.get('adminView') === 'true';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;

    const [sessions, total] = await Promise.all([
      prisma.supportSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastActivity: 'desc' },
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
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              senderType: true,
              createdAt: true
            }
          },
          _count: {
            select: { messages: true }
          }
        }
      }),
      prisma.supportSession.count({ where })
    ]);

    // 如果是管理端视图，添加未读消息计数
    let sessionsWithUnread = sessions;
    if (adminView) {
      sessionsWithUnread = await Promise.all(
        sessions.map(async (session) => {
          const unreadCount = await prisma.supportMessage.count({
            where: {
              sessionId: session.id,
              senderType: 'USER',
              status: { not: 'READ' }
            }
          });
          
          return {
            ...session,
            messageCount: session._count.messages,
            unreadCount
          };
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: sessionsWithUnread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching support sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - 创建新会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 简化验证，直接使用传入的数据
    const validatedData = {
      userId: body.userId || undefined,
      customerId: body.customerId || undefined,
      source: body.source || 'website',
      priority: body.priority || 'NORMAL',
      metadata: body.metadata || {},
      visitorName: body.visitorName || undefined,
      visitorEmail: body.visitorEmail || undefined,
      visitorPhone: body.visitorPhone || undefined,
      subject: body.subject || undefined,
      department: body.department || undefined,
    };

    // 生成唯一的会话ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 获取客服配置
    const config = await prisma.supportConfig.findFirst();
    const welcomeMessage = config?.welcomeMessage || "Hello! How can we help you today?";

    // 创建会话
    const session = await prisma.supportSession.create({
      data: {
        sessionId,
        ...validatedData,
        status: 'WAITING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        }
      }
    });

    // 创建欢迎消息
    await prisma.supportMessage.create({
      data: {
        sessionId: session.id,
        content: welcomeMessage,
        messageType: 'TEXT',
        senderType: 'SYSTEM',
        status: 'SENT'
      }
    });

    // 如果启用了自动分配，尝试分配客服
    if (config?.autoAssignment) {
      await autoAssignAgent(session.id, config.maxSessionsPerAgent);
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating support session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// 自动分配客服代表
async function autoAssignAgent(sessionId: string, maxSessionsPerAgent: number = 5) {
  try {
    // 查找可用的客服代表（角色为ADMIN或EDITOR，且当前会话数未达到上限）
    const availableAgents = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'EDITOR'] },
        active: true
      },
      include: {
        _count: {
          select: {
            assignedSessions: {
              where: {
                status: { in: ['WAITING', 'ACTIVE'] }
              }
            }
          }
        }
      }
    });

    // 找到会话数最少的客服
    const bestAgent = availableAgents
      .filter(agent => agent._count.assignedSessions < maxSessionsPerAgent)
      .sort((a, b) => a._count.assignedSessions - b._count.assignedSessions)[0];

    if (bestAgent) {
      await prisma.supportSession.update({
        where: { id: sessionId },
        data: {
          assignedTo: bestAgent.id,
          assignedAt: new Date(),
          status: 'ACTIVE'
        }
      });

      // 创建分配通知消息
      await prisma.supportMessage.create({
        data: {
          sessionId,
          content: `You have been connected to ${bestAgent.name}. How can I help you today?`,
          messageType: 'SYSTEM',
          senderType: 'SYSTEM',
          status: 'SENT'
        }
      });
    }
  } catch (error) {
    console.error('Error auto-assigning agent:', error);
  }
}
