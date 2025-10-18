import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (category && category !== 'All Categories') {
      where.category = category.toLowerCase();
    }
    
    if (status && status !== 'All Status') {
      where.published = status === 'Published';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        sku: true,
        price: true,
        comparePrice: true,
        costPrice: true,
        stock: true,
        lowStockAlert: true,
        weight: true,
        dimensions: true,
        images: true,
        category: true,
        subcategory: true,
        brand: true,
        tags: true,
        specifications: true,
        published: true,
        featured: true,
        seoTitle: true,
        seoDescription: true,
        metaKeywords: true,
        views: true,
        orders: true,
        rating: true,
        reviewCount: true,
        productType: true,
        isDigital: true,
        downloadLimit: true,
        downloadExpiry: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const stats = {
      total: await prisma.product.count(),
      published: await prisma.product.count({ where: { published: true } }),
      draft: await prisma.product.count({ where: { published: false } }),
    };

    return NextResponse.json({ products, stats });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      sku,
      price,
      comparePrice,
      costPrice,
      stock,
      lowStockAlert,
      weight,
      dimensions,
      category, 
      subcategory,
      brand,
      tags,
      images, 
      specifications, 
      published,
      featured,
      seoTitle,
      seoDescription,
      metaKeywords,
      productType,
      isDigital,
      downloadLimit,
      downloadExpiry
    } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Generate SKU if not provided
    let productSku = sku;
    if (!productSku) {
      const prefix = category.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      productSku = `${prefix}-${timestamp}`;
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        sku: productSku,
        price: price ? parseFloat(price.toString()) : null,
        comparePrice: comparePrice ? parseFloat(comparePrice.toString()) : null,
        costPrice: costPrice ? parseFloat(costPrice.toString()) : null,
        stock: stock ? parseInt(stock.toString()) : 0,
        lowStockAlert: lowStockAlert ? parseInt(lowStockAlert.toString()) : 10,
        weight: weight ? parseFloat(weight.toString()) : null,
        dimensions: dimensions || null,
        category: category.toLowerCase(),
        subcategory: subcategory?.toLowerCase() || null,
        brand: brand || null,
        tags: tags || [],
        images: images || [],
        specifications: specifications || {},
        published: published || false,
        featured: featured || false,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        metaKeywords: metaKeywords || [],
        productType: productType || 'PHYSICAL',
        isDigital: isDigital || false,
        downloadLimit: downloadLimit ? parseInt(downloadLimit.toString()) : null,
        downloadExpiry: downloadExpiry ? parseInt(downloadExpiry.toString()) : null,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
