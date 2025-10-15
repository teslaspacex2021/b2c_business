import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      summary,
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
      metaKeywords
    } = body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (description !== undefined) updateData.description = description;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = price ? parseFloat(price.toString()) : null;
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice.toString()) : null;
    if (costPrice !== undefined) updateData.costPrice = costPrice ? parseFloat(costPrice.toString()) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock.toString());
    if (lowStockAlert !== undefined) updateData.lowStockAlert = parseInt(lowStockAlert.toString());
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight.toString()) : null;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (category !== undefined) updateData.category = category.toLowerCase();
    if (subcategory !== undefined) updateData.subcategory = subcategory?.toLowerCase() || null;
    if (brand !== undefined) updateData.brand = brand;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (published !== undefined) updateData.published = published;
    if (featured !== undefined) updateData.featured = featured;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;

    const { id } = await params;
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
