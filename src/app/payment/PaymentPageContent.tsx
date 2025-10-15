'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements, LinkAuthenticationElement, useLinkAuthentication } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Stripe initialization commented out for demo
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  quoteId: string;
  customerEmail: string;
}

// PaymentForm component commented out for demo - Stripe not configured
/*
function PaymentForm({ clientSecret, quoteId, customerEmail }: PaymentFormProps) {
  // Stripe functionality disabled for demo
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe payment form would be rendered here in production.
        </AlertDescription>
      </Alert>
    </div>
  );
}
*/

export default function PaymentPageContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id') || 'demo-quote-123';

  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    quote: any;
    customer: any;
    loading: boolean;
    error: string | null;
  }>({
    clientSecret: '',
    quote: null,
    customer: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Simulate payment initialization with mock data
    setTimeout(() => {
      setPaymentData({
        clientSecret: 'pi_mock_client_secret_123',
        quote: {
          id: quoteId,
          quoteNumber: 'Q-2024-001',
          total: '1,299.00',
          currency: 'USD'
        },
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Example Corp'
        },
        loading: false,
        error: null,
      });
    }, 1000);
  }, [quoteId]);

  if (paymentData.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (paymentData.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Error</CardTitle>
            <CardDescription>{paymentData.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/quote/${quoteId}`}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quote
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quote, customer } = paymentData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/quote/${quoteId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quote
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Secure Payment</h1>
              <p className="text-sm text-muted-foreground">
                Complete your order payment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Enter your payment details to complete the order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Demo Payment Form - Stripe not configured */}
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is a demo payment page. Stripe integration is not configured in this environment.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={paymentData.customer?.email || ''}
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Information</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="1234 1234 1234 1234"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          disabled
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            disabled
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="lg" disabled>
                      Demo Payment Form (Stripe Not Configured)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote #</span>
                  <span className="font-medium">{quote?.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{customer?.company || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${quote?.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure by Stripe</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Payment Processing</div>
                    <div className="text-sm text-muted-foreground">
                      Your payment will be processed securely
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Order Confirmation</div>
                    <div className="text-sm text-muted-foreground">
                      You'll receive an email confirmation
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Processing & Shipping</div>
                    <div className="text-sm text-muted-foreground">
                      We'll prepare and ship your order
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}