import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { amount, reason } = await request.json();

    // Get the payment record
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        quote: true
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment is not completed' }, { status: 400 });
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({ error: 'No Stripe payment intent found' }, { status: 400 });
    }

    // Process refund with Stripe
    let refundAmount = amount;
    if (!refundAmount) {
      refundAmount = parseFloat(payment.amount.toString());
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        paymentId: payment.id,
        quoteId: payment.quoteId,
        processedBy: session.user.id
      }
    });

    // Update payment record
    const isFullRefund = refundAmount >= parseFloat(payment.amount.toString());
    const currentRefundAmount = parseFloat(payment.refundAmount?.toString() || '0');
    const newRefundAmount = currentRefundAmount + refundAmount;

    await prisma.payment.update({
      where: { id },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundedAt: new Date(),
        refundAmount: newRefundAmount,
        notes: `${payment.notes || ''}\nRefund processed: ${refundAmount} ${payment.currency} on ${new Date().toISOString()}. Stripe Refund ID: ${refund.id}`
      }
    });

    // Update quote status if fully refunded
    if (isFullRefund) {
      await prisma.quote.update({
        where: { id: payment.quoteId },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    // Log the refund action
    console.log(`Refund processed: ${refund.id}, Amount: ${refundAmount} ${payment.currency}, Payment: ${payment.id}`);

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        currency: payment.currency,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    
    // Handle Stripe-specific errors
    if (error instanceof Error) {
      if (error.message.includes('charge_already_refunded')) {
        return NextResponse.json(
          { error: 'This payment has already been refunded' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('amount_too_large')) {
        return NextResponse.json(
          { error: 'Refund amount exceeds the original payment amount' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
