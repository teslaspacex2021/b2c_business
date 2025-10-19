import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY';
if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_PLACEHOLDER_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY';
    if (!pk) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
    }
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
};

// Stripe webhook signature verification
export const verifyStripeSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
  );
};

// Create payment intent for quote with enhanced Link support and security
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {},
  customerEmail?: string,
  customerId?: string,
  options: {
    captureMethod?: 'automatic' | 'manual';
    confirmationMethod?: 'automatic' | 'manual';
    setupFutureUsage?: 'off_session' | 'on_session';
    applicationFeeAmount?: number;
    transferGroup?: string;
  } = {}
): Promise<Stripe.PaymentIntent> => {
  // Validate amount (minimum $0.50 USD or equivalent)
  const minAmount = currency === 'usd' ? 50 : 50; // Adjust for other currencies
  if (Math.round(amount * 100) < minAmount) {
    throw new Error(`Amount must be at least ${minAmount / 100} ${currency.toUpperCase()}`);
  }

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      ...metadata,
      created_at: new Date().toISOString(),
      source: 'b2b_platform'
    },
    capture_method: options.captureMethod || 'automatic',
    confirmation_method: options.confirmationMethod || 'automatic',
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never', // Prevent redirects for better UX
    },
    // Enhanced payment method options
    payment_method_options: {
      link: {
        persistent_token: customerEmail ? customerEmail : undefined,
      },
      card: {
        setup_future_usage: options.setupFutureUsage || 'off_session',
        request_three_d_secure: 'automatic', // Enhanced security
      },
      us_bank_account: {
        verification_method: 'automatic',
      },
    },
    // Receipt email
    receipt_email: customerEmail,
  };

  // Associate with Stripe customer if provided
  if (customerId) {
    paymentIntentParams.customer = customerId;
  }

  // Add application fee if specified (for marketplace scenarios)
  if (options.applicationFeeAmount) {
    paymentIntentParams.application_fee_amount = Math.round(options.applicationFeeAmount * 100);
  }

  // Add transfer group for connected accounts
  if (options.transferGroup) {
    paymentIntentParams.transfer_group = options.transferGroup;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    
    // Log payment intent creation for monitoring
    console.log(`Payment Intent created: ${paymentIntent.id}, Amount: ${amount} ${currency.toUpperCase()}`);
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
};

// Create customer in Stripe with Link support
export const createStripeCustomer = async (
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    name,
    metadata,
    // Enable Link for this customer
    preferred_locales: ['en'],
  });
};

// Create invoice for quote
export const createInvoice = async (
  customerId: string,
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>,
  metadata: Record<string, string> = {}
): Promise<Stripe.Invoice> => {
  // Create invoice items
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(item.amount * 100),
      currency: 'usd',
      description: item.description,
      quantity: item.quantity,
    });
  }

  // Create and finalize invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    metadata,
    auto_advance: false, // Don't auto-charge
  });

  return await stripe.invoices.finalizeInvoice(invoice.id);
};

// Get payment methods for customer
export const getCustomerPaymentMethods = async (
  customerId: string
): Promise<Stripe.PaymentMethod[]> => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data;
};

// Process refund with enhanced error handling
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason,
  metadata?: Record<string, string>
): Promise<Stripe.Refund> => {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      metadata: {
        ...metadata,
        refund_date: new Date().toISOString(),
        source: 'b2b_platform'
      }
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);
    
    console.log(`Refund created: ${refund.id}, Amount: ${refund.amount ? refund.amount / 100 : 'full'}`);
    
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
};

// Get payment intent details
export const getPaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
};

// Update payment intent
export const updatePaymentIntent = async (
  paymentIntentId: string,
  params: Stripe.PaymentIntentUpdateParams
): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.update(paymentIntentId, params);
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw new Error('Failed to update payment intent');
  }
};

// Cancel payment intent
export const cancelPaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    console.log(`Payment intent cancelled: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw new Error('Failed to cancel payment intent');
  }
};

// Create setup intent for saving payment methods
export const createSetupIntent = async (
  customerId: string,
  paymentMethodTypes: string[] = ['card']
): Promise<Stripe.SetupIntent> => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      usage: 'off_session',
      metadata: {
        created_at: new Date().toISOString(),
        source: 'b2b_platform'
      }
    });

    console.log(`Setup intent created: ${setupIntent.id} for customer: ${customerId}`);
    
    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error('Failed to create setup intent');
  }
};

// Get customer's saved payment methods
export const getCustomerSavedPaymentMethods = async (
  customerId: string,
  type: Stripe.PaymentMethodListParams.Type = 'card'
): Promise<Stripe.PaymentMethod[]> => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type,
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error retrieving customer payment methods:', error);
    throw new Error('Failed to retrieve payment methods');
  }
};

// Detach payment method from customer
export const detachPaymentMethod = async (paymentMethodId: string): Promise<Stripe.PaymentMethod> => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    console.log(`Payment method detached: ${paymentMethod.id}`);
    return paymentMethod;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw new Error('Failed to detach payment method');
  }
};

// Create checkout session for hosted checkout
export const createCheckoutSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  options: {
    customerEmail?: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    mode?: 'payment' | 'setup' | 'subscription';
    paymentMethodTypes?: string[];
  }
): Promise<Stripe.Checkout.Session> => {
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: options.mode || 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      payment_method_types: options.paymentMethodTypes || ['card'],
      metadata: {
        ...options.metadata,
        created_at: new Date().toISOString(),
        source: 'b2b_platform'
      },
      // Enable Link
      payment_method_options: {
        link: {
          persistent_token: options.customerEmail,
        },
      },
      // Collect customer information
      customer_creation: options.customerId ? undefined : 'always',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
    };

    if (options.customerId) {
      sessionParams.customer = options.customerId;
    } else if (options.customerEmail) {
      sessionParams.customer_email = options.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log(`Checkout session created: ${session.id}`);
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

// Validate webhook signature with better error handling
export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Webhook signature validation failed:', error.message);
      throw new Error(`Webhook signature validation failed: ${error.message}`);
    }
    throw new Error('Webhook signature validation failed');
  }
};
