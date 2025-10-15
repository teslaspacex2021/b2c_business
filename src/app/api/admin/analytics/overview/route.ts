import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// 获取概览数据分析
export async function GET(request: NextRequest) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'VIEW_ANALYTICS');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 默认30天
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 并行获取各种统计数据
    const [
      totalProducts,
      publishedProducts,
      totalCategories,
      totalUsers,
      totalContacts,
      recentContactsCount,
      totalCustomers,
      totalQuotes,
      recentContacts,
      recentQuotes,
      productsByCategory,
      contactsByStatus,
      quotesByStatus,
      monthlyTrends
    ] = await Promise.all([
      // 产品统计
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.category.count(),
      
      // 用户统计
      prisma.user.count(),
      
      // 联系人统计
      prisma.contact.count(),
      prisma.contact.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // 客户统计
      prisma.customer.count(),
      
      // 报价统计
      prisma.quote.count(),
      
      // 最近的联系人
      prisma.contact.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true
        }
      }),
      
      // 最近的报价
      prisma.quote.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              company: true
            }
          }
        }
      }),
      
      // 按分类的产品分布
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      // 联系人状态分布
      prisma.contact.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // 报价状态分布
      prisma.quote.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // 月度趋势数据
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as contacts_count
        FROM "contacts" 
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `
    ]);

    // 计算增长率
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));
    
    const [
      previousContacts,
      previousQuotes,
      previousCustomers
    ] = await Promise.all([
      prisma.contact.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: startDate
          } 
        }
      }),
      prisma.quote.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: startDate
          } 
        }
      }),
      prisma.customer.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: startDate
          } 
        }
      })
    ]);

    // 计算增长百分比
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const analytics = {
      overview: {
        totalProducts,
        publishedProducts,
        totalCategories,
        totalUsers,
        totalContacts,
        totalCustomers,
        totalQuotes,
        period: parseInt(period)
      },
      growth: {
        contacts: calculateGrowth(recentContactsCount, previousContacts),
        quotes: calculateGrowth(totalQuotes, previousQuotes),
        customers: calculateGrowth(totalCustomers, previousCustomers)
      },
      recent: {
        contacts: recentContacts,
        quotes: recentQuotes
      },
      distribution: {
        productsByCategory: productsByCategory.map(cat => ({
          name: cat.name,
          count: cat._count.products
        })),
        contactsByStatus: contactsByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        quotesByStatus: quotesByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      },
      trends: {
        monthly: monthlyTrends
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
