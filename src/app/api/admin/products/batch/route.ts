import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// 批量操作产品
export async function POST(request: NextRequest) {
  try {
    // 检查产品管理权限
    const permissionError = await checkPermission(request, 'MANAGE_PRODUCTS');
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action, productIds, data } = body;

    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and product IDs are required' },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'publish':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { published: true }
        });
        message = `${result.count} products published successfully`;
        break;

      case 'unpublish':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { published: false }
        });
        message = `${result.count} products unpublished successfully`;
        break;

      case 'feature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { featured: true }
        });
        message = `${result.count} products marked as featured`;
        break;

      case 'unfeature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { featured: false }
        });
        message = `${result.count} products unmarked as featured`;
        break;

      case 'delete':
        result = await prisma.product.deleteMany({
          where: { id: { in: productIds } }
        });
        message = `${result.count} products deleted successfully`;
        break;

      case 'update_category':
        if (!data?.categoryId) {
          return NextResponse.json(
            { error: 'Category ID is required for category update' },
            { status: 400 }
          );
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: data.categoryId }
        });
        message = `${result.count} products moved to new category`;
        break;

      case 'update_tags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { error: 'Tags array is required for tags update' },
            { status: 400 }
          );
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { tags: data.tags }
        });
        message = `${result.count} products tags updated`;
        break;

      case 'update_price':
        if (data?.priceAction === 'set' && data?.price !== undefined) {
          result = await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { price: parseFloat(data.price) }
          });
          message = `${result.count} products price set to ${data.price}`;
        } else if (data?.priceAction === 'increase' && data?.percentage !== undefined) {
          // 对于百分比增加，需要逐个更新
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true }
          });

          const updatePromises = products.map(product => {
            const currentPrice = product.price ? parseFloat(product.price.toString()) : 0;
            const newPrice = currentPrice * (1 + parseFloat(data.percentage) / 100);
            return prisma.product.update({
              where: { id: product.id },
              data: { price: newPrice }
            });
          });

          await Promise.all(updatePromises);
          message = `${products.length} products price increased by ${data.percentage}%`;
        } else if (data?.priceAction === 'decrease' && data?.percentage !== undefined) {
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true }
          });

          const updatePromises = products.map(product => {
            const currentPrice = product.price ? parseFloat(product.price.toString()) : 0;
            const newPrice = currentPrice * (1 - parseFloat(data.percentage) / 100);
            return prisma.product.update({
              where: { id: product.id },
              data: { price: Math.max(0, newPrice) } // 确保价格不为负
            });
          });

          await Promise.all(updatePromises);
          message = `${products.length} products price decreased by ${data.percentage}%`;
        } else {
          return NextResponse.json(
            { error: 'Invalid price update parameters' },
            { status: 400 }
          );
        }
        break;

      case 'update_stock':
        if (data?.stockAction === 'set' && data?.stock !== undefined) {
          result = await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { stock: parseInt(data.stock) }
          });
          message = `${result.count} products stock set to ${data.stock}`;
        } else if (data?.stockAction === 'add' && data?.quantity !== undefined) {
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, stock: true }
          });

          const updatePromises = products.map(product => {
            const newStock = (product.stock || 0) + parseInt(data.quantity);
            return prisma.product.update({
              where: { id: product.id },
              data: { stock: Math.max(0, newStock) }
            });
          });

          await Promise.all(updatePromises);
          message = `${products.length} products stock increased by ${data.quantity}`;
        } else if (data?.stockAction === 'subtract' && data?.quantity !== undefined) {
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, stock: true }
          });

          const updatePromises = products.map(product => {
            const newStock = (product.stock || 0) - parseInt(data.quantity);
            return prisma.product.update({
              where: { id: product.id },
              data: { stock: Math.max(0, newStock) }
            });
          });

          await Promise.all(updatePromises);
          message = `${products.length} products stock decreased by ${data.quantity}`;
        } else {
          return NextResponse.json(
            { error: 'Invalid stock update parameters' },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      affected: result?.count || productIds.length
    });

  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
