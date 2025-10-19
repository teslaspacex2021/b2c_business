'use client';

import { useState } from 'react';
import StripePaymentElement from '@/components/StripePaymentElement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestPaymentPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1500000); // $15000.00 in cents

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    toast.success('Payment completed successfully!');
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment System Test
          </h1>
          <p className="text-gray-600">
            Test the payment functionality with mock data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Mock */}
          <Card>
            <CardHeader>
              <CardTitle>Test Product</CardTitle>
              <CardDescription>Industrial Machinery A1</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    ${(paymentAmount / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">USD</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>SKU:</strong> TEST-001
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Category:</strong> Test Products
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> In Stock
                  </p>
                </div>

                <Button 
                  onClick={() => setShowPayment(true)}
                  className="w-full"
                  size="lg"
                >
                  Buy Now - ${(paymentAmount / 100).toFixed(2)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>
                {showPayment ? 'Complete your purchase' : 'Click "Buy Now" to start payment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPayment ? (
                <StripePaymentElement
                  amount={paymentAmount}
                  currency="usd"
                  productId="test-1"
                  productTitle="Test Product - Industrial Machinery A1"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Payment form will appear here when you click "Buy Now"
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Adjust test parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (in cents)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="50"
                  step="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current amount: ${(paymentAmount / 100).toFixed(2)} USD
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentAmount(29900)}
                >
                  $299.00
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentAmount(1500000)}
                >
                  $15,000.00
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentAmount(5000)}
                >
                  $50.00
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
