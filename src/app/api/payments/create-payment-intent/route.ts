import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { amount, currency = 'usd', metadata = {} } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent with enhanced options
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount should already be in cents
      currency,
      metadata: {
        ...metadata,
        userId: session?.user?.id || 'anonymous',
        userEmail: session?.user?.email || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Enable Link for faster checkout
      payment_method_options: {
        link: {
          persistent_token: session?.user?.email || undefined,
        },
        card: {
          setup_future_usage: 'off_session',
        },
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}