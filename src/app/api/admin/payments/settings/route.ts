import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Encryption functions for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function encrypt(text: string): string {
  if (!text) return '';
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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
    let dbSettings = await prisma.paymentSettings.findUnique({
      where: { id: 'default' }
    });

    // Create default settings if none exist
    if (!dbSettings) {
      dbSettings = await prisma.paymentSettings.create({
        data: {
          id: 'default',
          stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
          stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
          stripeSecretKey: process.env.STRIPE_SECRET_KEY ? encrypt(process.env.STRIPE_SECRET_KEY) : '',
          stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? encrypt(process.env.STRIPE_WEBHOOK_SECRET) : '',
        }
      });
    }

    // Prepare response with masked sensitive data
    const settings = {
      ...dbSettings,
      stripeSecretKey: dbSettings.stripeSecretKey ? 
        'sk_***' + (dbSettings.stripeSecretKey.length > 10 ? dbSettings.stripeSecretKey.slice(-4) : '****') : '',
      stripeWebhookSecret: dbSettings.stripeWebhookSecret ? 
        'whsec_***' + (dbSettings.stripeWebhookSecret.length > 10 ? dbSettings.stripeWebhookSecret.slice(-4) : '****') : '',
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await request.json();
    
    // Prepare data for database update
    const updateData: any = {
      stripeEnabled: settings.stripeEnabled,
      stripeLinkEnabled: settings.stripeLinkEnabled,
      linkPersistentToken: settings.linkPersistentToken,
      linkSaveCards: settings.linkSaveCards,
      defaultCurrency: settings.defaultCurrency,
      minimumAmount: settings.minimumAmount,
      maximumAmount: settings.maximumAmount,
      allowedCountries: settings.allowedCountries,
      requireBillingAddress: settings.requireBillingAddress,
      collectShippingAddress: settings.collectShippingAddress,
    };

    // Only update keys if they're provided and not masked
    if (settings.stripePublishableKey && !settings.stripePublishableKey.includes('***')) {
      updateData.stripePublishableKey = settings.stripePublishableKey;
    }
    
    if (settings.stripeSecretKey && !settings.stripeSecretKey.includes('***')) {
      updateData.stripeSecretKey = encrypt(settings.stripeSecretKey);
    }
    
    if (settings.stripeWebhookSecret && !settings.stripeWebhookSecret.includes('***')) {
      updateData.stripeWebhookSecret = encrypt(settings.stripeWebhookSecret);
    }

    // Update or create payment settings
    await prisma.paymentSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      }
    });

    console.log('Payment settings updated successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to save payment settings' },
      { status: 500 }
    );
  }
}