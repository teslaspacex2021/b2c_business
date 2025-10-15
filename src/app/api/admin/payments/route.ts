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
    const status = searchParams.get('status');
    const days = searchParams.get('days');
    const export_csv = searchParams.get('export');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (days && days !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      where.createdAt = {
        gte: daysAgo
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            title: true,
            total: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If export is requested, return CSV
    if (export_csv === 'true') {
      const csvHeaders = [
        'Payment ID',
        'Customer Name',
        'Customer Email',
        'Company',
        'Quote Number',
        'Amount',
        'Currency',
        'Status',
        'Payment Method',
        'Stripe Payment Intent ID',
        'Created At',
        'Paid At',
        'Refunded At',
        'Refund Amount',
        'Failure Reason',
        'Notes'
      ].join(',');

      const csvRows = payments.map(payment => [
        payment.id,
        `"${payment.customer.name}"`,
        payment.customer.email,
        `"${payment.customer.company || ''}"`,
        payment.quote.quoteNumber,
        payment.amount,
        payment.currency,
        payment.status,
        payment.paymentMethod,
        payment.stripePaymentIntentId || '',
        payment.createdAt.toISOString(),
        payment.paidAt?.toISOString() || '',
        payment.refundedAt?.toISOString() || '',
        payment.refundAmount || '',
        `"${payment.failureReason || ''}"`,
        `"${payment.notes || ''}"`
      ].join(','));

      const csv = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(payments);

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
