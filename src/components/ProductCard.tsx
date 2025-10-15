'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Star,
  ShoppingCart,
  Eye,
  ExternalLink,
  Tag,
  Truck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ProductCardProps {
  productId: string;
  title: string;
  summary?: string;
  price?: number;
  comparePrice?: number;
  currency?: string;
  images: string[];
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  lowStockAlert?: number;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
  onViewProduct?: () => void;
  onRequestQuote?: () => void;
  onAddToCart?: () => void;
  compact?: boolean;
}

export default function ProductCard({
  productId,
  title,
  summary,
  price,
  comparePrice,
  currency = 'USD',
  images,
  category,
  brand,
  rating,
  reviewCount = 0,
  stock = 0,
  lowStockAlert = 10,
  featured = false,
  published = true,
  tags = [],
  onViewProduct,
  onRequestQuote,
  onAddToCart,
  compact = false
}: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStockStatus = () => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (stock <= lowStockAlert) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const mainImage = images[0] || '/images/products/default.svg';
  const hasDiscount = comparePrice && price && comparePrice > price;
  const discountPercentage = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  if (compact) {
    return (
      <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="relative">
            <img 
              src={mainImage} 
              alt={title}
              className="w-full h-32 object-cover rounded-md"
            />
            {featured && (
              <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {title}
            </CardTitle>
            
            {brand && (
              <p className="text-xs text-gray-600">{brand}</p>
            )}
            
            {summary && (
              <p className="text-xs text-gray-600 line-clamp-2">{summary}</p>
            )}
            
            <div className="flex items-center justify-between">
              {price ? (
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-sm">{formatCurrency(price)}</span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(comparePrice!)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-600">Contact for Price</span>
              )}
              
              {rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <Badge className={`${stockStatus.color} text-xs`}>
              <StockIcon className="w-3 h-3 mr-1" />
              {stockStatus.label}
            </Badge>
            
            <div className="flex space-x-1 pt-2">
              {onViewProduct && (
                <Button variant="outline" size="sm" onClick={onViewProduct} className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
              {onRequestQuote && (
                <Button size="sm" onClick={onRequestQuote} className="flex-1">
                  <Tag className="w-3 h-3 mr-1" />
                  Quote
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="relative">
          <img 
            src={mainImage} 
            alt={title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {featured && (
              <Badge className="bg-orange-500 text-white">
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white">
                Save {discountPercentage}%
              </Badge>
            )}
          </div>
          
          <Badge className={`absolute top-3 right-3 ${stockStatus.color}`}>
            <StockIcon className="w-3 h-3 mr-1" />
            {stockStatus.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
              {title}
            </CardTitle>
          </div>
          
          {brand && (
            <p className="text-sm text-gray-600 mb-2">{brand}</p>
          )}
          
          {category && (
            <Badge variant="outline" className="text-xs mb-2">
              <Package className="w-3 h-3 mr-1" />
              {category}
            </Badge>
          )}
          
          {summary && (
            <p className="text-sm text-gray-700 line-clamp-3">{summary}</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className="border-t pt-4">
          {price ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold">{formatCurrency(price)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(comparePrice!)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-green-600">
                    You save {formatCurrency(comparePrice! - price)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">Contact for Pricing</p>
              <p className="text-sm text-gray-500">Custom quotes available</p>
            </div>
          )}
        </div>

        {/* Stock Info */}
        {stock > 0 && stock <= lowStockAlert && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Only {stock} left in stock
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {onViewProduct && (
            <Button variant="outline" onClick={onViewProduct} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
          
          {stock > 0 ? (
            <div className="flex space-x-2 flex-1">
              {onAddToCart && (
                <Button variant="outline" onClick={onAddToCart} className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              {onRequestQuote && (
                <Button onClick={onRequestQuote} className="flex-1">
                  <Tag className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              )}
            </div>
          ) : (
            onRequestQuote && (
              <Button onClick={onRequestQuote} className="flex-1">
                <Tag className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            )
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span>SKU: {productId.slice(-8).toUpperCase()}</span>
            <div className="flex items-center space-x-1">
              <Truck className="w-3 h-3" />
              <span>Free shipping available</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
