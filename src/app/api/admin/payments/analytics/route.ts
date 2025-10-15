import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get payment statistics from database
    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      totalRevenue,
      paymentsByMethod,
      recentPayments
    ] = await Promise.all([
      prisma.payment.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              company: true
            }
          },
          quote: {
            select: {
              quoteNumber: true,
              total: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Get Stripe Link usage statistics
    let linkStats = {
      linkPayments: 0,
      linkRevenue: 0,
      linkConversionRate: 0
    };

    try {
      // Get recent payment intents to analyze Link usage
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        created: {
          gte: Math.floor(startDate.getTime() / 1000)
        }
      });

      const linkPaymentIntents = paymentIntents.data.filter(pi => 
        pi.payment_method_types.includes('link') || 
        (pi.charges?.data?.[0]?.payment_method_details as any)?.type === 'link'
      );

      linkStats.linkPayments = linkPaymentIntents.length;
      linkStats.linkRevenue = linkPaymentIntents.reduce((sum, pi) => 
        sum + (pi.amount_received || 0), 0
      ) / 100; // Convert from cents
      linkStats.linkConversionRate = totalPayments > 0 ? 
        (linkStats.linkPayments / totalPayments) * 100 : 0;
    } catch (stripeError) {
      console.warn('Could not fetch Stripe Link statistics:', stripeError);
    }

    // Calculate success rate
    const successRate = totalPayments > 0 ? 
      (successfulPayments / totalPayments) * 100 : 0;

    // Prepare daily payment trends
    const dailyTrends = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    // Group by date
    const trendsByDate = dailyTrends.reduce((acc, trend) => {
      const date = trend.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count += trend._count.id;
      acc[date].revenue += Number(trend._sum.amount || 0);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return NextResponse.json({
      summary: {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        successRate: Math.round(successRate * 100) / 100,
        averageOrderValue: successfulPayments > 0 ? 
          Number(totalRevenue._sum.amount || 0) / successfulPayments : 0
      },
      linkStats,
      paymentsByMethod: paymentsByMethod.map(method => ({
        method: method.paymentMethod,
        count: method._count.id,
        revenue: Number(method._sum.amount || 0)
      })),
      dailyTrends: Object.entries(trendsByDate).map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue
      })).sort((a, b) => a.date.localeCompare(b.date)),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        customer: payment.customer,
        quote: payment.quote
      }))
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment analytics' },
      { status: 500 }
    );
  }
}