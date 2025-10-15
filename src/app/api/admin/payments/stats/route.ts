import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');

    // Build where clause for date filtering
    const where: any = {};
    
    if (days && days !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      where.createdAt = {
        gte: daysAgo
      };
    }

    // Get all payments for the period
    const payments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        status: true,
        createdAt: true,
        refundAmount: true
      }
    });

    // Calculate statistics
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'COMPLETED').length;
    const failedPayments = payments.filter(p => p.status === 'FAILED').length;
    const pendingPayments = payments.filter(p => ['PENDING', 'PROCESSING'].includes(p.status)).length;
    const refundedPayments = payments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).length;

    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    const totalRefunded = payments
      .filter(p => p.refundAmount)
      .reduce((sum, p) => sum + parseFloat(p.refundAmount?.toString() || '0'), 0);

    const netRevenue = totalRevenue - totalRefunded;

    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const averageOrderValue = successfulPayments > 0 ? totalRevenue / successfulPayments : 0;

    const stats = {
      totalPayments,
      totalRevenue: netRevenue,
      successfulPayments,
      failedPayments,
      pendingPayments,
      refundedPayments,
      successRate,
      averageOrderValue,
      totalRefunded
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
