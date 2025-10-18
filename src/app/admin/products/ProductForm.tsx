'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import CompatibleRichTextEditor from '@/components/forms/CompatibleRichTextEditor';

interface ProductFormProps {
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
}

export default function ProductForm({ onSubmit, onCancel, initialData, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    sku: initialData?.sku || '',
    price: initialData?.price?.toString() || '',
    comparePrice: initialData?.comparePrice?.toString() || '',
    costPrice: initialData?.costPrice?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    lowStockAlert: initialData?.lowStockAlert?.toString() || '10',
    weight: initialData?.weight?.toString() || '',
    category: initialData?.category || '',
    categoryId: initialData?.categoryId || '',
    subcategory: initialData?.subcategory || '',
    brand: initialData?.brand || '',
    tags: initialData?.tags || [],
    specifications: initialData?.specifications || {},
    published: initialData?.published || false,
    featured: initialData?.featured || false,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    metaKeywords: initialData?.metaKeywords || [],
    images: initialData?.images || [],
    // Digital product fields
    productType: initialData?.productType || 'PHYSICAL',
    isDigital: initialData?.isDigital || false,
    downloadLimit: initialData?.downloadLimit?.toString() || '',
    downloadExpiry: initialData?.downloadExpiry?.toString() || '',
  });

  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string, parentId?: string, parent?: {name: string}}>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories?includeChildren=true');
        if (response.ok) {
          const data = await response.json();
          // Flatten categories for easier display, showing parent > child hierarchy
          const flattenCategories = (cats: any[], parentName = '') => {
            let result: any[] = [];
            cats.forEach(cat => {
              if (cat.published) {
                const displayName = parentName ? `${parentName} > ${cat.name}` : cat.name;
                result.push({
                  ...cat,
                  displayName
                });
                if (cat.children && cat.children.length > 0) {
                  result = result.concat(flattenCategories(cat.children, displayName));
                }
              }
            });
            return result;
          };
          setCategories(flattenCategories(data.categories.filter((cat: any) => !cat.parentId)));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.metaKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([key]) => key !== keyToRemove)
      )
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.urls && result.urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...result.urls]
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="digital">Digital</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic product information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter product title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <CompatibleRichTextEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Enter detailed product description with formatting..."
                  label="Description"
                  height="250px"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId || ''}
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {(category as any).displayName || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="Enter subcategory"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingImage}
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        {isUploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="ml-2">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Images
                          </>
                        )}
                      </Button>
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Upload product images (JPG, PNG)
                    </span>
                  </div>
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Product Settings</CardTitle>
              <CardDescription>Configure digital product and download options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select
                  value={formData.productType}
                  onValueChange={(value) => {
                    handleInputChange('productType', value);
                    handleInputChange('isDigital', value === 'DIGITAL' || value === 'HYBRID');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHYSICAL">Physical Product</SelectItem>
                    <SelectItem value="DIGITAL">Digital Product</SelectItem>
                    <SelectItem value="HYBRID">Hybrid (Physical + Digital)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.productType === 'PHYSICAL' && 'Traditional physical product with shipping'}
                  {formData.productType === 'DIGITAL' && 'Downloadable digital product only'}
                  {formData.productType === 'HYBRID' && 'Physical product with digital downloads included'}
                </p>
              </div>

              {(formData.productType === 'DIGITAL' || formData.productType === 'HYBRID') && (
                <>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-3">Download Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="downloadLimit">Download Limit</Label>
                        <Input
                          id="downloadLimit"
                          type="number"
                          value={formData.downloadLimit}
                          onChange={(e) => handleInputChange('downloadLimit', e.target.value)}
                          placeholder="Unlimited"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum downloads per purchase (leave empty for unlimited)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="downloadExpiry">Download Expiry (Days)</Label>
                        <Input
                          id="downloadExpiry"
                          type="number"
                          value={formData.downloadExpiry}
                          onChange={(e) => handleInputChange('downloadExpiry', e.target.value)}
                          placeholder="Never expires"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Days until download access expires (leave empty for never)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-start space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 mt-0.5"></div>
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Digital Files Management</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                          After creating this product, you can upload digital files in the Digital Products section.
                          Files will be available for download after purchase.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Set pricing and manage inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="comparePrice">Compare Price ($)</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price ($)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {formData.productType !== 'DIGITAL' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                    <Input
                      id="lowStockAlert"
                      type="number"
                      value={formData.lowStockAlert}
                      onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.001"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="0.000"
                    />
                  </div>
                </div>
              )}

              {formData.productType === 'DIGITAL' && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Digital products don't require stock management or shipping weight.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Add tags and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Specifications</Label>
                <div className="space-y-2 mb-4">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 border rounded">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecification(key)}
                        className="ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Specification name"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Specification value"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                    />
                    <Button type="button" onClick={addSpecification} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Meta Keywords</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.metaKeywords.map(keyword => (
                    <Badge key={keyword} variant="outline" className="gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add a keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}

