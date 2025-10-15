import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { broadcastToSession } from '../sse/route';
import { emailService } from '@/lib/email-service';

// 创建消息的请求体验证
const createMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'ORDER_CARD', 'PRODUCT_CARD', 'SYSTEM']).default('TEXT'),
  senderType: z.enum(['USER', 'AGENT', 'SYSTEM']),
  senderId: z.string().optional(),
  senderName: z.string().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
    size: z.number().optional()
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET - 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.supportMessage.findMany({
        where: { sessionId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              assignedUser: {
                select: { id: true, name: true }
              }
            }
          }
        }
      }),
      prisma.supportMessage.count({ where: { sessionId } })
    ]);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - 创建新消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

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

    // 创建消息
    const message = await prisma.supportMessage.create({
      data: validatedData,
      include: {
        session: {
          select: {
            id: true,
            sessionId: true,
            assignedUser: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    // 更新会话的最后活动时间
    await prisma.supportSession.update({
      where: { id: validatedData.sessionId },
      data: { lastActivity: new Date() }
    });

    // 如果是用户发送的消息且会话状态为WAITING，将状态改为ACTIVE
    if (validatedData.senderType === 'USER' && session.status === 'WAITING') {
      await prisma.supportSession.update({
        where: { id: validatedData.sessionId },
        data: { status: 'ACTIVE' }
      });
    }

    // 实时广播新消息
    broadcastToSession(validatedData.sessionId, {
      type: 'new_message',
      message: {
        ...message,
        timestamp: message.createdAt
      }
    });

    // 如果是用户消息，触发AI自动回复和邮件通知
    if (validatedData.senderType === 'USER') {
      setTimeout(async () => {
        await generateAIResponse(validatedData.sessionId, validatedData.content);
      }, 1000);

      // 发送邮件通知给客服团队
      setTimeout(async () => {
        await sendEmailNotification(validatedData.sessionId, validatedData.content, session);
      }, 500);
    }

    // 如果是客服回复，发送邮件给客户
    if (validatedData.senderType === 'AGENT' && session.visitorEmail) {
      setTimeout(async () => {
        await sendAgentReplyEmail(
          session.visitorEmail!,
          validatedData.sessionId,
          validatedData.senderName || 'Support Agent',
          validatedData.content
        );
      }, 500);
    }

    return NextResponse.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error creating support message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

// AI自动回复功能
async function generateAIResponse(sessionId: string, userMessage: string) {
  try {
    // 简单的AI回复逻辑（可以后续集成真正的AI服务）
    const aiResponse = generateSmartResponse(userMessage);
    
    if (aiResponse) {
      // 创建AI回复消息
      const message = await prisma.supportMessage.create({
        data: {
          sessionId,
          content: aiResponse,
          messageType: 'TEXT',
          senderType: 'SYSTEM',
          senderName: 'AI Assistant',
          status: 'SENT'
        },
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              assignedUser: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      // 广播AI回复
      broadcastToSession(sessionId, {
        type: 'new_message',
        message: {
          ...message,
          timestamp: message.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
  }
}

// 智能回复生成器
function generateSmartResponse(userMessage: string): string | null {
  const message = userMessage.toLowerCase();
  
  // 问候语
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm here to help you. What can I assist you with today?";
  }
  
  // 产品相关询问
  if (message.includes('product') || message.includes('item') || message.includes('catalog')) {
    return "I'd be happy to help you with our products! You can browse our catalog at /product or I can connect you with a specialist. What specific products are you interested in?";
  }
  
  // 价格相关询问
  if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
    return "For pricing information and quotes, I can connect you with our sales team. You can also request a quote directly from any product page. Would you like me to transfer you to a sales representative?";
  }
  
  // 订单相关询问
  if (message.includes('order') || message.includes('delivery') || message.includes('shipping')) {
    return "For order-related inquiries, I can help you track your order or connect you with our logistics team. Do you have an order number I can help you with?";
  }
  
  // 技术支持
  if (message.includes('problem') || message.includes('issue') || message.includes('help') || message.includes('support')) {
    return "I understand you need assistance. Let me connect you with one of our support specialists who can help resolve your issue. Please describe your problem in detail.";
  }
  
  // 联系信息
  if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
    return "You can reach us at support@b2bbusiness.com or call us at +1 (555) 123-4567. Our business hours are Mon-Fri 9AM-6PM EST. How else can I help you today?";
  }
  
  // 默认回复
  if (message.length > 10) {
    return "Thank you for your message. I'm processing your request and will connect you with the right specialist shortly. Is there anything specific I can help clarify while we connect you?";
  }
  
  return null;
}

// 发送邮件通知给客服团队
async function sendEmailNotification(sessionId: string, userMessage: string, session: any) {
  try {
    const inquiry = {
      sessionId,
      visitorName: session.visitorName || session.user?.name || session.customer?.name,
      visitorEmail: session.visitorEmail || session.user?.email || session.customer?.email,
      visitorPhone: session.visitorPhone || session.customer?.phone,
      subject: session.subject,
      message: userMessage,
      timestamp: new Date(),
      source: session.source || 'website',
      priority: session.priority || 'NORMAL'
    };

    await emailService.sendSupportInquiry(inquiry);
    
    // 如果有客户邮箱，发送自动回复
    if (inquiry.visitorEmail) {
      await emailService.sendAutoReply(inquiry);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// 发送客服回复邮件给客户
async function sendAgentReplyEmail(
  customerEmail: string,
  sessionId: string,
  agentName: string,
  message: string
) {
  try {
    await emailService.sendSupportReply(customerEmail, sessionId, agentName, message);
  } catch (error) {
    console.error('Error sending agent reply email:', error);
  }
}
