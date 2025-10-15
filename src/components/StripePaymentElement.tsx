'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51R2laMI1rKnXAiuHNfFfNNzLIfYekWFocalFEuyrsaLmPqCBm5a9Z6N10uj7hEVjOBmBkj28JEkDnLqL9WyCtJth00d0jbN7Z0'
);

interface StripePaymentElementProps {
  amount: number;
  currency?: string;
  productId: string;
  productTitle: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

interface CheckoutFormProps {
  amount: number;
  productId: string;
  productTitle: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ amount, productId, productTitle, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?product=${productId}`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
        onError?.(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred.');
        onError?.(error.message || 'An unexpected error occurred');
      }
    } else {
      // Payment succeeded
      onSuccess?.(null);
      toast.success('Payment successful!');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h3 className="font-semibold">{productTitle}</h3>
            <p className="text-sm text-muted-foreground">Secure payment processing</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${(amount / 100).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">USD</p>
          </div>
        </div>

        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      {message && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Button 
          type="submit" 
          disabled={isLoading || !stripe || !elements}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${(amount / 100).toFixed(2)}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Secure Payment
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            SSL Encrypted
          </div>
        </div>
      </div>
    </form>
  );
}

export default function StripePaymentElement({
  amount,
  currency = 'usd',
  productId,
  productTitle,
  onSuccess,
  onError
}: StripePaymentElementProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency,
        metadata: {
          productId,
          productTitle,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          onError?.(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to initialize payment');
        onError?.('Failed to initialize payment');
        setLoading(false);
      });
  }, [amount, currency, productId, productTitle, onError]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Secure Payment
          </CardTitle>
          <CardDescription>
            Setting up your secure payment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorBackground: 'hsl(var(--background))',
      colorText: 'hsl(var(--foreground))',
      colorDanger: 'hsl(var(--destructive))',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Complete your purchase with our secure payment system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              amount={amount}
              productId={productId}
              productTitle={productTitle}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}
