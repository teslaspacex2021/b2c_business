import { NextRequest, NextResponse } from 'next/server';
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

    // For development: Create a mock payment intent
    console.log('Creating mock payment intent for development');
    
    const mockId = 'pi_' + Math.random().toString(36).substr(2, 24);
    const mockSecret = Math.random().toString(36).substr(2, 24);
    
    const mockPaymentIntent = {
      id: mockId,
      client_secret: mockId + '_secret_' + mockSecret,
      amount: Math.round(amount),
      currency,
      status: 'requires_payment_method',
      metadata: {
        ...metadata,
        userId: session?.user?.id || 'anonymous',
        userEmail: session?.user?.email || '',
      },
      created: Math.floor(Date.now() / 1000)
    };

    console.log('Mock payment intent created:', mockPaymentIntent.id);

    return NextResponse.json({
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}