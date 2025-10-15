'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct } from '@/contexts/ProductContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StripePaymentElement from '@/components/StripePaymentElement';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Package, 
  Truck, 
  Shield, 
  MessageCircle,
  Eye,
  TrendingUp,
  Award,
  CheckCircle,
  Info,
  CreditCard
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  summary?: string;
  description: string;
  sku?: string;
  price?: number | string;
  comparePrice?: number | string;
  stock: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  tags: string[];
  specifications?: Record<string, string>;
  featured: boolean;
  rating?: number | string;
  reviewCount: number;
  views: number;
  orders: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailContentProps {
  product: Product;
}

export default function ProductDetailContent({ product }: ProductDetailContentProps) {
  const { setCurrentProduct } = useProduct();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Set current product in context when component mounts
  useEffect(() => {
    setCurrentProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      url: `${window.location.origin}/product/${product.id}`
    });

    // Cleanup when component unmounts
    return () => {
      setCurrentProduct(null);
    };
  }, [product, setCurrentProduct]);

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const formatPrice = (price?: number | string) => {
    if (!price) return 'Contact for Price';
    return `$${parseFloat(price.toString()).toFixed(2)}`;
  };

  const getNumericPrice = (price?: number | string): number => {
    if (!price) return 0;
    return parseFloat(price.toString());
  };

  const rating = product.rating ? parseFloat(product.rating.toString()) : 4.5;
  const numericPrice = getNumericPrice(product.price);
  const totalPrice = numericPrice * quantity;

  const handleAddToWishlist = () => {
    // Get existing wishlist from localStorage
    const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // Check if product is already in wishlist
    const isAlreadyInWishlist = existingWishlist.some((item: any) => item.id === product.id);
    
    if (isAlreadyInWishlist) {
      alert('This product is already in your wishlist!');
      return;
    }
    
    // Add product to wishlist
    const wishlistItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      addedAt: new Date().toISOString()
    };
    
    const updatedWishlist = [...existingWishlist, wishlistItem];
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    alert('Product added to wishlist!');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this product: ${product.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Product link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Product link copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/product" className="text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/product?category=${product.category}`} className="text-muted-foreground hover:text-foreground">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex] || '/images/products/default.jpg'}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.featured && <Badge variant="default">Featured</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>SKU: {product.sku || 'N/A'}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{product.orders} orders</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
                <span className="font-medium ml-2">{rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && parseFloat(product.comparePrice.toString()) > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.comparePrice && parseFloat(product.comparePrice.toString()) > parseFloat((product.price || 0).toString()) && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${(parseFloat(product.comparePrice.toString()) - parseFloat((product.price || 0).toString())).toFixed(2)}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <Info className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Overview</h3>
              <div 
                className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: product.summary || product.description.substring(0, 300) + '...' 
                }}
              />
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
                {numericPrice > 0 ? (
                  <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="flex-1">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Buy Now - {formatPrice(totalPrice)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                        <DialogDescription>
                          Secure payment for {quantity}x {product.title}
                        </DialogDescription>
                      </DialogHeader>
                      <StripePaymentElement
                        amount={Math.round(totalPrice * 100)} // Convert to cents
                        productId={product.id}
                        productTitle={`${quantity}x ${product.title}`}
                        onSuccess={() => {
                          setPaymentDialogOpen(false);
                          // Redirect to success page or show success message
                        }}
                        onError={(error) => {
                          console.error('Payment error:', error);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button size="lg" className="flex-1" asChild>
                    <Link href={`/quote?productId=${product.id}`}>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Request Quote
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/quote?productId=${product.id}`}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Get Quote
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleAddToWishlist}>
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-medium">Quality Assured</div>
                  <div className="text-sm text-muted-foreground">Certified products</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-medium">Fast Shipping</div>
                  <div className="text-sm text-muted-foreground">Worldwide delivery</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="font-medium">Warranty</div>
                  <div className="text-sm text-muted-foreground">1 year guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                  <CardDescription>
                    Detailed technical information about this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-muted">
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Description</CardTitle>
                  <CardDescription>
                    Complete product information and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {/* Product Summary Section */}
                    {product.summary && (
                      <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Product Summary</h4>
                        <div 
                          className="text-blue-800"
                          dangerouslySetInnerHTML={{ __html: product.summary }} 
                        />
                      </div>
                    )}
                    
                    {/* Detailed Description */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Detailed Information</h4>
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                    
                    {product.brand && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Brand Information</h4>
                        <p className="text-gray-700">Manufactured by <strong>{product.brand}</strong></p>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Product Categories</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product.category}
                        </Badge>
                        {product.subcategory && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {product.subcategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    See what our customers say about this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to review this product and help other customers.
                    </p>
                    <Button>Write a Review</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Delivery options and shipping details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Standard Shipping</h4>
                        <p className="text-muted-foreground">5-7 business days</p>
                        <p className="text-sm text-muted-foreground">Free for orders over $500</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Express Shipping</h4>
                        <p className="text-muted-foreground">2-3 business days</p>
                        <p className="text-sm text-muted-foreground">Additional charges apply</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">International Shipping</h4>
                      <p className="text-muted-foreground">
                        We ship worldwide. Delivery times and costs vary by destination.
                        Contact us for a detailed quote.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
