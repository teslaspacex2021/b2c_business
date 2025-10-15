'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Settings,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  sku?: string;
  stock: number;
  lowStockAlert: number;
  price?: number;
  categoryRef?: {
    name: string;
    slug: string;
  };
}

interface LowStockStats {
  total: number;
  outOfStock: number;
  lowStock: number;
  criticalStock: number;
}

interface LowStockAlertProps {
  threshold?: number;
  showFullList?: boolean;
  maxItems?: number;
}

export default function LowStockAlert({ 
  threshold = 10, 
  showFullList = false, 
  maxItems = 5 
}: LowStockAlertProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<LowStockStats>({
    total: 0,
    outOfStock: 0,
    lowStock: 0,
    criticalStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchLowStockProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        threshold: threshold.toString(),
        limit: showFullList ? '50' : maxItems.toString()
      });

      const response = await fetch(`/api/admin/products/low-stock?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch low stock products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStockAlert = async (productId: string, alertThreshold: number) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/products/low-stock', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          lowStockAlert: alertThreshold
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Stock alert threshold updated",
        });
        fetchLowStockProducts();
        setDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update stock alert",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating stock alert:', error);
      toast({
        title: "Error",
        description: "Failed to update stock alert",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [threshold, showFullList, maxItems]);

  const getStockStatus = (stock: number, alertThreshold: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-600 text-white', severity: 'critical' };
    } else if (stock <= 5) {
      return { label: 'Critical', color: 'bg-orange-600 text-white', severity: 'high' };
    } else if (stock <= alertThreshold) {
      return { label: 'Low Stock', color: 'bg-yellow-600 text-white', severity: 'medium' };
    }
    return { label: 'Normal', color: 'bg-green-600 text-white', severity: 'low' };
  };

  const openThresholdDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewThreshold(product.lowStockAlert);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading stock alerts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Critical Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.criticalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Low Stock Products
              </CardTitle>
              <CardDescription>
                Products that need attention due to low inventory levels
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLowStockProducts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No low stock products found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const status = getStockStatus(product.stock, product.lowStockAlert);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{product.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {product.sku && <span>SKU: {product.sku}</span>}
                            {product.categoryRef && (
                              <>
                                <span>•</span>
                                <span>{product.categoryRef.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Current Stock</p>
                        <p className="font-bold text-lg">{product.stock}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Alert Threshold</p>
                        <p className="font-medium">{product.lowStockAlert}</p>
                      </div>

                      <Badge className={status.color}>
                        {status.label}
                      </Badge>

                      <div className="flex space-x-2">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openThresholdDialog(product)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>

                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/products/${product.id}`} target="_blank">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!showFullList && stats.total > maxItems && (
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <a href="/admin/products?filter=low-stock">
                      View All {stats.total} Low Stock Products
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threshold Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock Alert Threshold</DialogTitle>
            <DialogDescription>
              Set the minimum stock level for {selectedProduct?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="threshold">Alert Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll be alerted when stock falls to or below this level
              </p>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Current stock: {selectedProduct?.stock} units
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedProduct && updateStockAlert(selectedProduct.id, newThreshold)}
              disabled={updating === selectedProduct?.id}
            >
              {updating === selectedProduct?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Threshold'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
