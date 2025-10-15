'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuoteDialog from '@/components/QuoteDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Package, 
  ArrowRight, 
  Star, 
  ShoppingCart,
  Eye,
  Heart
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  sku?: string;
  price?: number | string; // Can be Decimal from database or number
  comparePrice?: number | string;
  stock: number;
  images: string[];
  category: string;
  categoryId?: string;
  categoryRef?: {
    id: string;
    name: string;
    slug: string;
  };
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

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
}

// Helper function to extract plain text from HTML
const stripHtml = (html: string) => {
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback for SSR - simple regex to remove HTML tags
  return html.replace(/<[^>]*>/g, '');
};

export default function ProductsPageContent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{id: string, name: string, slug: string, count: number, parentId?: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories?includeProducts=true')
        ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        } else {
          console.error('Failed to fetch products');
          setProducts([]);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          // Build hierarchical category structure
          const buildCategoryOptions = (cats: Category[]) => {
            const result: Array<{id: string, name: string, slug: string, count: number, parentId?: string}> = [];
            cats.forEach(cat => {
              if (cat._count?.products && cat._count.products > 0 || (cat.children && cat.children.some((child: Category) => child._count?.products && child._count.products > 0))) {
                result.push({
                  id: cat.id,
                  name: cat.name,
                  slug: cat.slug,
                  count: cat._count?.products || 0
                });
                if (cat.children && cat.children.length > 0) {
                  cat.children.forEach((child: Category) => {
                    if (child._count?.products && child._count.products > 0) {
                      result.push({
                        id: child.id,
                        name: `${cat.name} > ${child.name}`,
                        slug: child.slug,
                        count: child._count?.products || 0,
                        parentId: cat.id
                      });
                    }
                  });
                }
              }
            });
            return result;
          };
          
          const categoryOptions = buildCategoryOptions(categoriesData.categories.filter((cat: Category) => !cat.parentId));
          setCategoryOptions([{ id: 'all', name: 'All Categories', slug: 'all', count: 0 }, ...categoryOptions]);
        } else {
          console.error('Failed to fetch categories');
          setCategoryOptions([{ id: 'all', name: 'All Categories', slug: 'all', count: 0 }]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setProducts([]);
        setCategoryOptions([{ id: 'all', name: 'All Categories', slug: 'all', count: 0 }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductView = (productId: string) => {
    // Navigate to product detail page using Next.js router
    router.push(`/product/${productId}`);
  };

  const handleQuoteRequest = (product: Product) => {
    setSelectedProduct(product);
    setQuoteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
            <Package className="w-3 h-3 mr-1" />
            Product Catalog
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Products
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
            Discover our comprehensive range of high-quality products designed for international trade success
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-background border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-auto" style={{ gridTemplateColumns: `repeat(${Math.min(categoryOptions.length, 4)}, 1fr)` }}>
                {categoryOptions.slice(0, 4).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
          
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-64 bg-muted"></div>
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-muted rounded w-16"></div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Clickable image and header area */}
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="h-64 bg-gradient-to-br from-muted/50 to-muted/20 relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                        <Package className="w-16 h-16" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle wishlist functionality
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.categoryRef?.name || categoryOptions.find(cat => cat.id === product.categoryId)?.name || product.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">
                            {product.rating ? parseFloat(product.rating.toString()).toFixed(1) : '4.8'}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {product.title}
                      </CardTitle>
                    </CardHeader>
                  </Link>
                  
                  {/* Non-clickable content area with buttons */}
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-2">
                      {stripHtml(product.description)}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.price ? (
                          <span className="text-lg font-semibold text-primary">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-semibold text-primary">
                            Contact for Price
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {product.stock} in stock
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleProductView(product.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleQuoteRequest(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Quote
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/cta-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white hover:bg-white/30">
            💡 Custom Solutions
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            We specialize in custom solutions and product inquiries. Our team can help you find or develop exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              Contact Us
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
              <a href="mailto:info@b2bbusiness.com">
                Get Quote
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Quote Dialog */}
      {selectedProduct && (
        <QuoteDialog
          isOpen={quoteDialogOpen}
          onClose={() => setQuoteDialogOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
