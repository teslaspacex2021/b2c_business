'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id');
  const errorMessage = searchParams.get('error');

  const [retryLoading, setRetryLoading] = useState(false);

  const handleRetryPayment = async () => {
    if (!quoteId) return;

    setRetryLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/payment?quote_id=${quoteId}&client_secret=${data.clientSecret}`;
      } else {
        throw new Error('Failed to retry payment');
      }
    } catch (error) {
      console.error('Retry payment error:', error);
    } finally {
      setRetryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Error Header */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-red-700">
              We couldn't process your payment. Please try again or contact support.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Error Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Payment Error
                </CardTitle>
                <CardDescription>
                  There was an issue processing your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Common reasons for payment failure:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Insufficient funds or credit limit exceeded</li>
                    <li>• Incorrect card details</li>
                    <li>• Card expired or blocked</li>
                    <li>• Bank security measures</li>
                    <li>• Network connectivity issues</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">What you can do:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium mt-0.5">
                        1
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Try a different payment method</div>
                        <div className="text-muted-foreground">Use another card or payment option</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium mt-0.5">
                        2
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Contact your bank</div>
                        <div className="text-muted-foreground">Verify that your card allows online transactions</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium mt-0.5">
                        3
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Try again later</div>
                        <div className="text-muted-foreground">Wait a few minutes and try the payment again</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
                <CardDescription>
                  Our support team can assist you with payment issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-muted-foreground">support@b2bbusiness.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please include your quote number when contacting support for faster assistance.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quoteId && (
                  <Button
                    onClick={handleRetryPayment}
                    disabled={retryLoading}
                    className="w-full"
                  >
                    {retryLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Payment
                      </>
                    )}
                  </Button>
                )}
                <Link href={`/quote/${quoteId}`}>
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quote
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Alternative Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alternative Payment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Wire Transfer</div>
                    <div className="text-sm text-muted-foreground">Bank transfer option</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Invoice Payment</div>
                    <div className="text-sm text-muted-foreground">Request an invoice</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Contact for Alternatives
                </Button>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-blue-800">
                    Your payment information is secure and encrypted.
                    We do not store your card details.
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