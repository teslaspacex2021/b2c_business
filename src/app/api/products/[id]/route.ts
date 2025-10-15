import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          sku: true,
          price: true,
          comparePrice: true,
          stock: true,
          images: true,
          category: true,
          categoryId: true,
          subcategory: true,
          brand: true,
          tags: true,
          specifications: true,
          featured: true,
          rating: true,
          reviewCount: true,
          views: true,
          orders: true,
          seoTitle: true,
          seoDescription: true,
          metaKeywords: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!product || !product.published) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Increment view count
      try {
        await prisma.product.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
      } catch (updateError) {
        console.warn('Failed to increment view count:', updateError);
      }

      return NextResponse.json(product);
    } catch (dbError) {
      console.warn('Database connection failed, returning mock data:', dbError);
      
      // Return mock product data
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
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    }
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}