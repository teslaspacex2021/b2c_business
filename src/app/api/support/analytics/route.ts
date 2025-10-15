import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const agentId = searchParams.get('agentId');

    // 设置日期范围
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 默认30天前
    const end = endDate ? new Date(endDate) : new Date();

    // 构建查询条件
    const whereClause: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (agentId) {
      whereClause.assignedTo = agentId;
    }

    // 并行查询各种统计数据
    const [
      totalSessions,
      sessionsByStatus,
      sessionsByPriority,
      averageResponseTime,
      averageResolutionTime,
      customerSatisfaction,
      topAgents,
      dailyStats,
      hourlyDistribution,
      messageStats
    ] = await Promise.all([
      // 总会话数
      prisma.supportSession.count({ where: whereClause }),

      // 按状态分组的会话数
      prisma.supportSession.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true }
      }),

      // 按优先级分组的会话数
      prisma.supportSession.groupBy({
        by: ['priority'],
        where: whereClause,
        _count: { id: true }
      }),

      // 平均响应时间（首次回复时间）
      calculateAverageResponseTime(whereClause),

      // 平均解决时间
      calculateAverageResolutionTime(whereClause),

      // 客户满意度
      prisma.supportSession.aggregate({
        where: {
          ...whereClause,
          rating: { not: null }
        },
        _avg: { rating: true },
        _count: { rating: true }
      }),

      // 客服代表排行
      getTopAgents(whereClause),

      // 每日统计
      getDailyStats(start, end, whereClause),

      // 小时分布
      getHourlyDistribution(whereClause),

      // 消息统计
      getMessageStats(whereClause)
    ]);

    const analytics = {
      overview: {
        totalSessions,
        averageResponseTime: averageResponseTime || 0,
        averageResolutionTime: averageResolutionTime || 0,
        customerSatisfaction: {
          averageRating: customerSatisfaction._avg.rating || 0,
          totalRatings: customerSatisfaction._count.rating || 0
        }
      },
      sessionsByStatus: sessionsByStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      sessionsByPriority: sessionsByPriority.map(item => ({
        priority: item.priority,
        count: item._count.id
      })),
      topAgents,
      dailyStats,
      hourlyDistribution,
      messageStats
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching support analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// 计算平均响应时间
async function calculateAverageResponseTime(whereClause: any): Promise<number | null> {
  try {
    const sessions = await prisma.supportSession.findMany({
      where: whereClause,
      include: {
        messages: {
          where: { senderType: 'AGENT' },
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      }
    });

    const responseTimes = sessions
      .filter(session => session.messages.length > 0)
      .map(session => {
        const sessionStart = new Date(session.createdAt);
        const firstResponse = new Date(session.messages[0].createdAt);
        return firstResponse.getTime() - sessionStart.getTime();
      });

    if (responseTimes.length === 0) return null;

    const averageMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(averageMs / 1000 / 60); // 转换为分钟
  } catch (error) {
    console.error('Error calculating average response time:', error);
    return null;
  }
}

// 计算平均解决时间
async function calculateAverageResolutionTime(whereClause: any): Promise<number | null> {
  try {
    const closedSessions = await prisma.supportSession.findMany({
      where: {
        ...whereClause,
        status: 'CLOSED',
        endedAt: { not: null }
      }
    });

    if (closedSessions.length === 0) return null;

    const resolutionTimes = closedSessions.map(session => {
      const sessionStart = new Date(session.createdAt);
      const sessionEnd = new Date(session.endedAt!);
      return sessionEnd.getTime() - sessionStart.getTime();
    });

    const averageMs = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
    return Math.round(averageMs / 1000 / 60); // 转换为分钟
  } catch (error) {
    console.error('Error calculating average resolution time:', error);
    return null;
  }
}

// 获取客服代表排行
async function getTopAgents(whereClause: any) {
  try {
    const agentStats = await prisma.supportSession.groupBy({
      by: ['assignedTo'],
      where: {
        ...whereClause,
        assignedTo: { not: null }
      },
      _count: { id: true },
      _avg: { rating: true }
    });

    const agentsWithDetails = await Promise.all(
      agentStats.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.assignedTo! },
          select: { id: true, name: true, email: true }
        });

        return {
          agent: user,
          sessionsCount: stat._count.id,
          averageRating: stat._avg.rating || 0
        };
      })
    );

    return agentsWithDetails
      .filter(agent => agent.agent)
      .sort((a, b) => b.sessionsCount - a.sessionsCount)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting top agents:', error);
    return [];
  }
}

// 获取每日统计
async function getDailyStats(startDate: Date, endDate: Date, whereClause: any) {
  try {
    const dailyData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStats = await prisma.supportSession.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        sessions: dayStats
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return [];
  }
}

// 获取小时分布
async function getHourlyDistribution(whereClause: any) {
  try {
    const sessions = await prisma.supportSession.findMany({
      where: whereClause,
      select: { createdAt: true }
    });

    const hourlyStats = Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = new Date(session.createdAt).getHours();
      hourlyStats[hour]++;
    });

    return hourlyStats.map((count, hour) => ({
      hour,
      sessions: count
    }));
  } catch (error) {
    console.error('Error getting hourly distribution:', error);
    return [];
  }
}

// 获取消息统计
async function getMessageStats(whereClause: any) {
  try {
    const [totalMessages, messagesByType, messagesBySender] = await Promise.all([
      prisma.supportMessage.count({
        where: {
          session: whereClause
        }
      }),
      
      prisma.supportMessage.groupBy({
        by: ['messageType'],
        where: {
          session: whereClause
        },
        _count: { messageType: true }
      }),
      
      prisma.supportMessage.groupBy({
        by: ['senderType'],
        where: {
          session: whereClause
        },
        _count: { senderType: true }
      })
    ]);

    return {
      totalMessages,
      byType: messagesByType.map(item => ({
        type: item.messageType,
        count: item._count.messageType
      })),
      bySender: messagesBySender.map(item => ({
        sender: item.senderType,
        count: item._count.senderType
      }))
    };
  } catch (error) {
    console.error('Error getting message stats:', error);
    return {
      totalMessages: 0,
      byType: [],
      bySender: []
    };
  }
}
