import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get payment with all related data
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        quote: {
          include: {
            creator: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment is not completed' },
        { status: 400 }
      );
    }

    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Send receipt email
    await sendEmail({
      to: payment.customer.email,
      subject: `Payment Receipt - ${payment.quote.quoteNumber}`,
      template: 'payment_receipt',
      data: {
        customerName: payment.customer.name,
        quoteNumber: payment.quote.quoteNumber,
        quoteTitle: payment.quote.title,
        amount: formatCurrency(payment.amount, payment.currency),
        currency: payment.currency.toUpperCase(),
        paymentDate: formatDate(payment.paidAt || payment.createdAt),
        paymentMethod: payment.paymentMethod,
        transactionId: payment.stripePaymentIntentId,
        receiptId: payment.id,
        companyName: payment.customer.company || '',
        customerEmail: payment.customer.email
      }
    });

    // Log the receipt send action
    console.log(`Receipt sent for payment ${payment.id} to ${payment.customer.email}`);

    return NextResponse.json({
      success: true,
      message: 'Receipt sent successfully'
    });

  } catch (error) {
    console.error('Error sending receipt:', error);
    return NextResponse.json(
      { error: 'Failed to send receipt' },
      { status: 500 }
    );
  }
}
