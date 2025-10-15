'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Tag,
  DollarSign,
  Package,
  FolderOpen,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface ProductBatchActionsProps {
  selectedProducts: string[];
  categories: Array<{ id: string; name: string }>;
  onActionComplete: () => void;
  onClearSelection: () => void;
}

interface BatchActionData {
  categoryId?: string;
  tags?: string[];
  priceAction?: 'set' | 'increase' | 'decrease';
  price?: string;
  percentage?: string;
  stockAction?: 'set' | 'add' | 'subtract';
  stock?: string;
  quantity?: string;
}

export default function ProductBatchActions({
  selectedProducts,
  categories,
  onActionComplete,
  onClearSelection
}: ProductBatchActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionData, setActionData] = useState<BatchActionData>({});
  const { toast } = useToast();

  const handleBatchAction = async (action: string, data?: BatchActionData) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select products first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          productIds: selectedProducts,
          data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message,
        });
        onActionComplete();
        onClearSelection();
        setDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to perform batch action',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Batch action error:', error);
      toast({
        title: "Error",
        description: 'Failed to perform batch action',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openActionDialog = (action: string) => {
    setCurrentAction(action);
    setActionData({});
    setDialogOpen(true);
  };

  const executeAction = () => {
    handleBatchAction(currentAction, actionData);
  };

  const renderActionForm = () => {
    switch (currentAction) {
      case 'update_category':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Select Category</Label>
              <Select 
                value={actionData.categoryId} 
                onValueChange={(value) => setActionData({ ...actionData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'update_tags':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={actionData.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setActionData({ ...actionData, tags });
                }}
              />
            </div>
          </div>
        );

      case 'update_price':
        return (
          <div className="space-y-4">
            <div>
              <Label>Price Action</Label>
              <Select 
                value={actionData.priceAction} 
                onValueChange={(value: 'set' | 'increase' | 'decrease') => 
                  setActionData({ ...actionData, priceAction: value, price: '', percentage: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set Fixed Price</SelectItem>
                  <SelectItem value="increase">Increase by Percentage</SelectItem>
                  <SelectItem value="decrease">Decrease by Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionData.priceAction === 'set' && (
              <div>
                <Label htmlFor="price">New Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={actionData.price || ''}
                  onChange={(e) => setActionData({ ...actionData, price: e.target.value })}
                />
              </div>
            )}

            {(actionData.priceAction === 'increase' || actionData.priceAction === 'decrease') && (
              <div>
                <Label htmlFor="percentage">Percentage</Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={actionData.percentage || ''}
                  onChange={(e) => setActionData({ ...actionData, percentage: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'update_stock':
        return (
          <div className="space-y-4">
            <div>
              <Label>Stock Action</Label>
              <Select 
                value={actionData.stockAction} 
                onValueChange={(value: 'set' | 'add' | 'subtract') => 
                  setActionData({ ...actionData, stockAction: value, stock: '', quantity: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set Stock Level</SelectItem>
                  <SelectItem value="add">Add to Stock</SelectItem>
                  <SelectItem value="subtract">Subtract from Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionData.stockAction === 'set' && (
              <div>
                <Label htmlFor="stock">Stock Level</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={actionData.stock || ''}
                  onChange={(e) => setActionData({ ...actionData, stock: e.target.value })}
                />
              </div>
            )}

            {(actionData.stockAction === 'add' || actionData.stockAction === 'subtract') && (
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={actionData.quantity || ''}
                  onChange={(e) => setActionData({ ...actionData, quantity: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Are you sure you want to delete {selectedProducts.length} product(s)?
                </p>
                <p className="text-xs text-red-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionTitle = () => {
    switch (currentAction) {
      case 'update_category': return 'Update Category';
      case 'update_tags': return 'Update Tags';
      case 'update_price': return 'Update Pricing';
      case 'update_stock': return 'Update Stock';
      case 'delete': return 'Delete Products';
      default: return 'Batch Action';
    }
  };

  const isActionValid = () => {
    switch (currentAction) {
      case 'update_category':
        return !!actionData.categoryId;
      case 'update_tags':
        return actionData.tags && actionData.tags.length > 0;
      case 'update_price':
        return actionData.priceAction && (
          (actionData.priceAction === 'set' && actionData.price) ||
          ((actionData.priceAction === 'increase' || actionData.priceAction === 'decrease') && actionData.percentage)
        );
      case 'update_stock':
        return actionData.stockAction && (
          (actionData.stockAction === 'set' && actionData.stock) ||
          ((actionData.stockAction === 'add' || actionData.stockAction === 'subtract') && actionData.quantity)
        );
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            {selectedProducts.length} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Batch Actions:
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Quick Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('publish')}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          Publish
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('unpublish')}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <EyeOff className="w-3 h-3" />
          Unpublish
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('feature')}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <Star className="w-3 h-3" />
          Feature
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('unfeature')}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <StarOff className="w-3 h-3" />
          Unfeature
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Advanced Actions */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openActionDialog('update_category')}
              className="flex items-center gap-1"
            >
              <FolderOpen className="w-3 h-3" />
              Category
            </Button>
          </DialogTrigger>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openActionDialog('update_tags')}
          className="flex items-center gap-1"
        >
          <Tag className="w-3 h-3" />
          Tags
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openActionDialog('update_price')}
          className="flex items-center gap-1"
        >
          <DollarSign className="w-3 h-3" />
          Pricing
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openActionDialog('update_stock')}
          className="flex items-center gap-1"
        >
          <Package className="w-3 h-3" />
          Stock
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => openActionDialog('delete')}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </Button>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              This action will be applied to {selectedProducts.length} selected product(s).
            </DialogDescription>
          </DialogHeader>

          {renderActionForm()}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={isLoading || !isActionValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Apply Changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
