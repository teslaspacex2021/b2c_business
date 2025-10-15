import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Decryption function
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get payment settings from database
    const dbSettings = await prisma.paymentSettings.findUnique({
      where: { id: 'default' }
    });

    if (!dbSettings || !dbSettings.stripeSecretKey) {
      return NextResponse.json(
        { 
          connected: false, 
          error: 'Stripe secret key not configured',
          details: 'Please configure your Stripe secret key in the payment settings.'
        },
        { status: 400 }
      );
    }

    // Decrypt the secret key
    const secretKey = decrypt(dbSettings.stripeSecretKey);
    
    if (!secretKey || !secretKey.startsWith('sk_')) {
      return NextResponse.json(
        { 
          connected: false, 
          error: 'Invalid Stripe secret key format',
          details: 'The stored secret key appears to be invalid or corrupted.'
        },
        { status: 400 }
      );
    }

    // Test Stripe connection
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });

    // Try to retrieve account information
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      connected: true,
      account: {
        id: account.id,
        country: account.country,
        currency: account.default_currency,
        email: account.email,
        displayName: account.display_name || account.business_profile?.name,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      }
    });

  } catch (error: any) {
    console.error('Stripe connection test failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    let errorDetails = '';
    
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Invalid Stripe API key';
      errorDetails = 'The provided secret key is not valid. Please check your Stripe dashboard.';
    } else if (error.type === 'StripePermissionError') {
      errorMessage = 'Insufficient permissions';
      errorDetails = 'The API key does not have sufficient permissions.';
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Connection failed';
      errorDetails = 'Unable to connect to Stripe. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        connected: false, 
        error: errorMessage,
        details: errorDetails,
        type: error.type || 'unknown'
      },
      { status: 400 }
    );
  }
}