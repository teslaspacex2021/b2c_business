import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaymentIntent } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const quoteId = searchParams.get('quoteId');
    const stripePaymentIntentId = searchParams.get('stripePaymentIntentId');

    if (!paymentId && !quoteId && !stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment ID, Quote ID, or Stripe Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};
    
    if (paymentId) {
      where.id = paymentId;
    } else if (quoteId) {
      where.quoteId = quoteId;
    } else if (stripePaymentIntentId) {
      where.stripePaymentIntentId = stripePaymentIntentId;
    }

    // Find payment with related data
    const payment = await prisma.payment.findFirst({
      where,
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
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment is still pending/processing, check Stripe for updates
    if (['PENDING', 'PROCESSING'].includes(payment.status) && payment.stripePaymentIntentId) {
      try {
        const stripePaymentIntent = await getPaymentIntent(payment.stripePaymentIntentId);
        
        // Update local status based on Stripe status
        let newStatus = payment.status;
        
        switch (stripePaymentIntent.status) {
          case 'succeeded':
            newStatus = 'COMPLETED';
            break;
          case 'processing':
            newStatus = 'PROCESSING';
            break;
          case 'requires_payment_method':
          case 'requires_confirmation':
          case 'requires_action':
            newStatus = 'PENDING';
            break;
          case 'canceled':
            newStatus = 'CANCELLED';
            break;
          case 'payment_failed':
            newStatus = 'FAILED';
            break;
        }

        // Update payment status if it changed
        if (newStatus !== payment.status) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newStatus,
              ...(newStatus === 'COMPLETED' && !payment.paidAt ? { paidAt: new Date() } : {}),
              ...(stripePaymentIntent.last_payment_error ? { 
                failureReason: stripePaymentIntent.last_payment_error.message 
              } : {})
            }
          });

          // Also update quote status if payment completed
          if (newStatus === 'COMPLETED' && payment.quote.status !== 'PAID') {
            await prisma.quote.update({
              where: { id: payment.quoteId },
              data: { 
                status: 'PAID',
                paidAt: new Date(),
                amountPaid: stripePaymentIntent.amount / 100
              }
            });
          }

          // Return updated status
          return NextResponse.json({
            ...payment,
            status: newStatus,
            ...(newStatus === 'COMPLETED' && !payment.paidAt ? { paidAt: new Date().toISOString() } : {}),
            ...(stripePaymentIntent.last_payment_error ? { 
              failureReason: stripePaymentIntent.last_payment_error.message 
            } : {})
          });
        }
      } catch (stripeError) {
        console.error('Error checking Stripe payment status:', stripeError);
        // Continue with local status if Stripe check fails
      }
    }

    return NextResponse.json(payment);

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
