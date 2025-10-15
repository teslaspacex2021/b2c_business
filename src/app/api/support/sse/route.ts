import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// 存储活跃的SSE连接
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Session ID is required', { status: 400 });
  }

  // 创建SSE流
  const stream = new ReadableStream({
    start(controller) {
      // 存储连接
      connections.set(sessionId, controller);

      // 发送初始连接消息
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`);

      // 设置心跳
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(sessionId);
        }
      }, 30000); // 30秒心跳

      // 清理函数
      const cleanup = () => {
        clearInterval(heartbeat);
        connections.delete(sessionId);
      };

      // 监听连接关闭
      request.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      connections.delete(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// 广播消息到指定会话
export function broadcastToSession(sessionId: string, data: any) {
  const controller = connections.get(sessionId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error broadcasting to session:', sessionId, error);
      connections.delete(sessionId);
    }
  }
}

// 广播消息到所有连接
export function broadcastToAll(data: any) {
  for (const [sessionId, controller] of connections.entries()) {
    try {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error broadcasting to session:', sessionId, error);
      connections.delete(sessionId);
    }
  }
}

// 获取活跃连接数
export function getActiveConnections() {
  return connections.size;
}
