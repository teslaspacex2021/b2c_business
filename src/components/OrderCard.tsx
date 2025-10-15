'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderCardProps {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  totalAmount: number;
  currency?: string;
  items: OrderItem[];
  shippingAddress?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  onViewDetails?: () => void;
  onTrackOrder?: () => void;
  compact?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    icon: Package
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
};

export default function OrderCard({
  orderId,
  orderNumber,
  status,
  orderDate,
  totalAmount,
  currency = 'USD',
  items,
  shippingAddress,
  trackingNumber,
  estimatedDelivery,
  onViewDetails,
  onTrackOrder,
  compact = false
}: OrderCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Order #{orderNumber}
            </CardTitle>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(orderDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Items:</span>
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            {trackingNumber && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tracking:</span>
                <span className="font-mono text-xs">{trackingNumber}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 mt-4">
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
            {onTrackOrder && trackingNumber && (
              <Button variant="outline" size="sm" onClick={onTrackOrder} className="flex-1">
                <Truck className="w-3 h-3 mr-1" />
                Track
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Order #{orderNumber}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(orderDate)}
            </p>
          </div>
          <Badge className={statusInfo.color}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Order Items */}
        <div>
          <h4 className="font-medium mb-3">Items ({items.length})</h4>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{item.name}</h5>
                  <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-gray-600">each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Shipping Information */}
        {(shippingAddress || trackingNumber || estimatedDelivery) && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Shipping Information</h4>
            <div className="space-y-2 text-sm">
              {shippingAddress && (
                <div>
                  <span className="text-gray-600">Address: </span>
                  <span>{shippingAddress}</span>
                </div>
              )}
              {trackingNumber && (
                <div>
                  <span className="text-gray-600">Tracking: </span>
                  <span className="font-mono">{trackingNumber}</span>
                </div>
              )}
              {estimatedDelivery && (
                <div>
                  <span className="text-gray-600">Estimated Delivery: </span>
                  <span>{formatDate(estimatedDelivery)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
          )}
          {onTrackOrder && trackingNumber && (
            <Button variant="outline" onClick={onTrackOrder} className="flex-1">
              <Truck className="w-4 h-4 mr-2" />
              Track Package
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
