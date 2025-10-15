import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// 获取低库存产品
export async function GET(request: NextRequest) {
  try {
    // 检查产品管理权限
    const permissionError = await checkPermission(request, 'MANAGE_PRODUCTS');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseInt(searchParams.get('threshold') || '10');

    const skip = (page - 1) * limit;

    // 获取低库存产品（库存小于等于预警阈值的产品）
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            stock: {
              lte: threshold
            }
          },
          {
            AND: [
              { lowStockAlert: { gt: 0 } },
              {
                stock: {
                  lte: prisma.product.fields.lowStockAlert
                }
              }
            ]
          }
        ]
      },
      include: {
        categoryRef: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { stock: 'asc' },
        { updatedAt: 'desc' }
      ],
      skip,
      take: limit
    });

    // 获取总数
    const total = await prisma.product.count({
      where: {
        OR: [
          {
            stock: {
              lte: threshold
            }
          },
          {
            AND: [
              { lowStockAlert: { gt: 0 } },
              {
                stock: {
                  lte: prisma.product.fields.lowStockAlert
                }
              }
            ]
          }
        ]
      }
    });

    // 获取统计信息
    const stats = {
      total,
      outOfStock: await prisma.product.count({
        where: { stock: 0 }
      }),
      lowStock: await prisma.product.count({
        where: {
          stock: {
            gt: 0,
            lte: threshold
          }
        }
      }),
      criticalStock: await prisma.product.count({
        where: {
          stock: {
            gt: 0,
            lte: 5
          }
        }
      })
    };

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新库存预警设置
export async function PUT(request: NextRequest) {
  try {
    // 检查产品管理权限
    const permissionError = await checkPermission(request, 'MANAGE_PRODUCTS');
    if (permissionError) return permissionError;

    const body = await request.json();
    const { productId, lowStockAlert } = body;

    if (!productId || lowStockAlert === undefined) {
      return NextResponse.json(
        { error: 'Product ID and low stock alert threshold are required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { lowStockAlert: parseInt(lowStockAlert) }
    });

    return NextResponse.json({
      message: 'Low stock alert updated successfully',
      product
    });

  } catch (error) {
    console.error('Error updating low stock alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
