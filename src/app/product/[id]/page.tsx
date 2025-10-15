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
    
    // Mock product data for testing - in production this would come from database
    const mockProducts = {
      '1': {
        id: '1',
        title: 'Industrial Machinery A1',
        description: 'High-quality industrial machinery for manufacturing. This advanced machinery is designed for heavy-duty industrial applications, featuring state-of-the-art technology and robust construction. Perfect for manufacturing facilities looking to increase productivity and efficiency.',
        sku: 'IMA-001',
        price: 15000,
        comparePrice: 18000,
        stock: 5,
        images: [
          '/images/products/machinery-1.jpg',
          '/images/products/machinery-2.jpg',
          '/images/products/machinery-3.jpg'
        ],
        category: 'Machinery',
        categoryId: 'machinery',
        subcategory: 'Industrial',
        brand: 'TechCorp',
        tags: ['industrial', 'machinery', 'manufacturing'],
        specifications: {
          power: '500W',
          weight: '200kg',
          dimensions: '150x100x80cm',
          warranty: '2 years',
          certification: 'ISO 9001'
        },
        featured: true,
        rating: 4.5,
        reviewCount: 12,
        views: 150,
        orders: 8,
        seoTitle: 'Industrial Machinery A1 - High Quality Manufacturing Equipment',
        seoDescription: 'Professional industrial machinery for manufacturing. High-quality, durable, and efficient equipment for your business needs.',
        metaKeywords: ['industrial', 'machinery', 'manufacturing', 'equipment'],
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      '2': {
        id: '2',
        title: 'Electronic Components Kit',
        description: 'Complete electronic components kit for professionals. This comprehensive kit includes all the essential electronic components needed for professional projects and prototyping. Ideal for engineers, technicians, and electronics enthusiasts.',
        sku: 'ECK-002',
        price: 299,
        comparePrice: 399,
        stock: 25,
        images: [
          '/images/products/electronics-1.jpg',
          '/images/products/electronics-2.jpg'
        ],
        category: 'Electronics',
        categoryId: 'electronics',
        subcategory: 'Components',
        brand: 'ElectroPro',
        tags: ['electronics', 'components', 'kit'],
        specifications: {
          items: '500+',
          warranty: '2 years',
          packaging: 'Organized case',
          compatibility: 'Universal'
        },
        featured: false,
        rating: 4.2,
        reviewCount: 8,
        views: 89,
        orders: 15,
        seoTitle: 'Electronic Components Kit - Professional Grade Components',
        seoDescription: 'Complete electronic components kit with 500+ items. Perfect for professionals and enthusiasts.',
        metaKeywords: ['electronics', 'components', 'kit', 'professional'],
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    const product = mockProducts[id as keyof typeof mockProducts];
    
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
