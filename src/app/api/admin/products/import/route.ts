import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// POST - 导入产品数据
export async function POST(request: NextRequest) {
  try {
    // 检查产品管理权限
    const permissionError = await checkPermission(request, 'MANAGE_PRODUCTS');
    if (permissionError) return permissionError;

    const body = await request.json();
    const { products, options = {} } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
    }

    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 获取所有分类用于映射
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });

    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    });

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        // 数据验证和清理
        if (!productData.name) {
          results.errors.push(`Row ${i + 1}: Product name is required`);
          results.failed++;
          continue;
        }

        // 生成slug（如果没有提供）
        const slug = productData.slug || productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // 查找分类ID
        let categoryId = null;
        if (productData.category) {
          categoryId = categoryMap.get(productData.category.toLowerCase());
          if (!categoryId) {
            // 如果分类不存在，创建新分类
            const newCategory = await prisma.category.create({
              data: {
                name: productData.category,
                slug: productData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: `Auto-created category for ${productData.category}`
              }
            });
            categoryId = newCategory.id;
            categoryMap.set(productData.category.toLowerCase(), categoryId);
          }
        }

        // 准备产品数据
        const productCreateData: any = {
          name: productData.name,
          slug: slug,
          description: productData.description || '',
          price: parseFloat(productData.price) || 0,
          comparePrice: productData.comparePrice ? parseFloat(productData.comparePrice) : null,
          sku: productData.sku || null,
          stock: parseInt(productData.stock) || 0,
          published: productData.status === 'published' || productData.published === true,
          featured: productData.featured === true || productData.featured === 'Yes',
          tags: Array.isArray(productData.tags) ? productData.tags : 
                (typeof productData.tags === 'string' ? productData.tags.split(',').map(t => t.trim()) : []),
          images: Array.isArray(productData.images) ? productData.images : [],
          specifications: productData.specifications || {}
        };

        if (categoryId) {
          productCreateData.categoryId = categoryId;
        }

        // 检查是否已存在相同slug的产品
        const existingProduct = await prisma.product.findUnique({
          where: { slug: slug }
        });

        if (existingProduct) {
          if (options.updateExisting) {
            // 更新现有产品
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: productCreateData
            });
            results.success++;
          } else {
            results.errors.push(`Row ${i + 1}: Product with slug "${slug}" already exists`);
            results.failed++;
          }
        } else {
          // 创建新产品
          await prisma.product.create({
            data: productCreateData
          });
          results.success++;
        }

      } catch (error) {
        console.error(`Error importing product ${i + 1}:`, error);
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Import products error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
