'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Download,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  stripePaymentIntentId: string;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
  quote: {
    quoteNumber: string;
    title: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

interface PaymentStatusTrackerProps {
  paymentId?: string;
  quoteId?: string;
  stripePaymentIntentId?: string;
  onStatusChange?: (status: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function PaymentStatusTracker({
  paymentId,
  quoteId,
  stripePaymentIntentId,
  onStatusChange,
  showActions = true,
  compact = false
}: PaymentStatusTrackerProps) {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (paymentId || quoteId || stripePaymentIntentId) {
      loadPaymentStatus();
      
      // Start polling for status updates if payment is pending
      const interval = setInterval(() => {
        if (payment && ['PENDING', 'PROCESSING'].includes(payment.status)) {
          loadPaymentStatus(false);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [paymentId, quoteId, stripePaymentIntentId]);

  const loadPaymentStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (paymentId) params.append('paymentId', paymentId);
      if (quoteId) params.append('quoteId', quoteId);
      if (stripePaymentIntentId) params.append('stripePaymentIntentId', stripePaymentIntentId);

      const response = await fetch(`/api/payments/status?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
        
        if (onStatusChange && data.status !== payment?.status) {
          onStatusChange(data.status);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load payment status');
      }
    } catch (err) {
      console.error('Error loading payment status:', err);
      setError('Failed to load payment status');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setPolling(true);
    await loadPaymentStatus();
    setPolling(false);
    toast.success('Payment status refreshed');
  };

  const sendReceipt = async () => {
    if (!payment) return;

    try {
      const response = await fetch(`/api/payments/${payment.id}/send-receipt`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Receipt sent successfully');
      } else {
        toast.error('Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      toast.error('Failed to send receipt');
    }
  };

  const downloadReceipt = async () => {
    if (!payment) return;

    try {
      const response = await fetch(`/api/payments/${payment.id}/receipt`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.quote.quoteNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Receipt downloaded');
      } else {
        toast.error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 25;
      case 'PROCESSING':
        return 50;
      case 'COMPLETED':
        return 100;
      case 'FAILED':
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : ''}>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment not found</h3>
            <p className="text-muted-foreground">
              No payment information available for the provided identifier.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          {getStatusIcon(payment.status)}
          <div>
            <div className="font-medium">
              {formatCurrency(payment.amount, payment.currency)}
            </div>
            <div className="text-sm text-muted-foreground">
              {payment.quote.quoteNumber}
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(payment.status)}
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(payment.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Status
        </CardTitle>
        <CardDescription>
          Track the status of your payment for quote {payment.quote.quoteNumber}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(payment.status)}
            <div>
              <div className="font-semibold text-lg">
                {formatCurrency(payment.amount, payment.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                {payment.quote.title}
              </div>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(payment.status)}
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStatus}
                disabled={polling}
                className="ml-2"
              >
                <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{getProgressValue(payment.status)}%</span>
          </div>
          <Progress value={getProgressValue(payment.status)} className="h-2" />
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Payment Method:</span>
            <div className="font-medium">{payment.paymentMethod}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <div className="font-medium">{formatDate(payment.createdAt)}</div>
          </div>
          {payment.paidAt && (
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-medium">{formatDate(payment.paidAt)}</div>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Customer:</span>
            <div className="font-medium">{payment.customer.name}</div>
          </div>
        </div>

        {/* Failure Reason */}
        {payment.failureReason && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Failed:</strong> {payment.failureReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            {payment.status === 'COMPLETED' && (
              <>
                <Button variant="outline" onClick={sendReceipt}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Receipt
                </Button>
                <Button variant="outline" onClick={downloadReceipt}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </>
            )}
            
            {payment.stripePaymentIntentId && (
              <Button variant="outline" asChild>
                <a
                  href={`https://dashboard.stripe.com/payments/${payment.stripePaymentIntentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Stripe
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
