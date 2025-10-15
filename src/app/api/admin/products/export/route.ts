import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// GET - 导出产品数据
export async function GET(request: NextRequest) {
  try {
    // 检查产品管理权限
    const permissionError = await checkPermission(request, 'MANAGE_PRODUCTS');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    // 构建查询条件
    const where: any = {};
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    if (status && status !== 'all') {
      where.published = status === 'published';
    }

    // 获取产品数据
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeaders = [
        'ID',
        'Name',
        'Slug',
        'Description',
        'Price',
        'Compare Price',
        'SKU',
        'Stock',
        'Category',
        'Status',
        'Featured',
        'Tags',
        'Created At',
        'Updated At'
      ];

      const csvRows = products.map(product => [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        product.slug,
        `"${(product.description || '').replace(/"/g, '""').replace(/<[^>]*>/g, '')}"`, // 移除HTML标签
        product.price || 0,
        product.comparePrice || '',
        product.sku || '',
        product.stock || 0,
        product.category?.name || '',
        product.published ? 'Published' : 'Draft',
        product.featured ? 'Yes' : 'No',
        `"${(product.tags || []).join(', ')}"`,
        product.createdAt.toISOString(),
        product.updatedAt.toISOString()
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'json') {
      // 生成JSON格式
      const jsonData = {
        exportDate: new Date().toISOString(),
        totalProducts: products.length,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          sku: product.sku,
          stock: product.stock,
          category: product.category?.name,
          categorySlug: product.category?.slug,
          status: product.published ? 'published' : 'draft',
          featured: product.featured,
          tags: product.tags,
          images: product.images,
          specifications: product.specifications,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }))
      };

      return new Response(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="products_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Export products error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
