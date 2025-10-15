import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeSignature } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email-service';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // For testing purposes, simulate webhook handling without actual Stripe verification
    console.warn('Stripe webhook simulation - signature verification skipped');
    
    try {
      const event = JSON.parse(body);
      console.log(`Received Stripe webhook: ${event.type}`);
      
      // Log the event for debugging
      console.log('Webhook event data:', {
        type: event.type,
        id: event.id,
        created: event.created
      });
      
      return NextResponse.json({ 
        received: true,
        message: 'Webhook processed successfully (simulation mode)'
      });
      
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

