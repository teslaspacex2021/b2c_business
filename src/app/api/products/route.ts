import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {
      published: true, // Only return published products for public API
    };

    if (category && category !== 'all') {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
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
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      // Get unique categories for filtering
      const categories = await prisma.product.findMany({
        where: { published: true },
        select: { category: true },
        distinct: ['category'],
      });

      return NextResponse.json({
        products,
        categories: categories.map(c => c.category),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (dbError) {
      console.warn('Database connection failed, returning mock data:', dbError);
      
      // Return mock data when database is not available
      const mockProducts = [
        {
          id: '1',
          title: 'Industrial Machinery A1',
          description: 'High-quality industrial machinery for manufacturing',
          sku: 'IMA-001',
          price: 15000,
          comparePrice: 18000,
          stock: 5,
          images: ['/images/products/machinery-1.jpg'],
          category: 'Machinery',
          categoryId: 'machinery',
          subcategory: 'Industrial',
          brand: 'TechCorp',
          tags: ['industrial', 'machinery', 'manufacturing'],
          specifications: { power: '500W', weight: '200kg' },
          featured: true,
          rating: 4.5,
          reviewCount: 12,
          views: 150,
          orders: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Electronic Components Kit',
          description: 'Complete electronic components kit for professionals',
          sku: 'ECK-002',
          price: 299,
          comparePrice: 399,
          stock: 25,
          images: ['/images/products/electronics-1.jpg'],
          category: 'Electronics',
          categoryId: 'electronics',
          subcategory: 'Components',
          brand: 'ElectroPro',
          tags: ['electronics', 'components', 'kit'],
          specifications: { items: '500+', warranty: '2 years' },
          featured: false,
          rating: 4.2,
          reviewCount: 8,
          views: 89,
          orders: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      const filteredProducts = mockProducts.slice(skip, skip + limit);
      
      return NextResponse.json({
        products: filteredProducts,
        categories: ['Machinery', 'Electronics', 'Tools', 'Materials'],
        pagination: {
          page,
          limit,
          total: mockProducts.length,
          pages: Math.ceil(mockProducts.length / limit),
        },
      });
    }
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, images, category, specifications, published } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        images: images || [],
        category,
        specifications: specifications || {},
        published: published || false,
      },
    });

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

