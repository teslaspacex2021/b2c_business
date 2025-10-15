import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailContent from './ProductDetailContent';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3004';
    const response = await fetch(`${baseUrl}/api/products/${id}`);
    
    if (!response.ok) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    const product = await response.json();

    return {
      title: `${product.title} | B2B Business`,
      description: product.seoDescription || product.description || `${product.title} - High-quality product for international trade`,
      keywords: product.metaKeywords?.join(', ') || product.tags?.join(', ') || '',
      openGraph: {
        title: product.seoTitle || product.title,
        description: product.seoDescription || product.description,
        images: product.images?.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Details',
      description: 'Product details page',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    
    // Fetch product from API
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      console.error(`Product ${id} not found - API returned ${response.status}`);
      notFound();
    }

    const product = await response.json();
    
    if (!product) {
      console.error(`Product ${id} not found`);
      notFound();
    }

    return <ProductDetailContent product={product} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}
