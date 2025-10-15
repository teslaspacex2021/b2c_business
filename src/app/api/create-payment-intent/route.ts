import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'usd', metadata = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Mock payment intent creation
    console.warn('Stripe not configured, returning mock payment intent');
    
    const mockPaymentIntent = {
      id: 'pi_mock_' + Date.now(),
      client_secret: 'pi_mock_' + Date.now() + '_secret_mock',
      amount: amount,
      currency: currency,
      status: 'requires_payment_method',
      metadata: metadata,
      created: Math.floor(Date.now() / 1000)
    };

    return NextResponse.json({
      success: true,
      paymentIntent: mockPaymentIntent
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}