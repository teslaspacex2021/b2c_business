import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all published categories (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      where: {
        published: true,
      },
      include: {
        parent: true,
        children: includeChildren ? {
          where: { published: true },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        } : false,
        _count: {
          select: {
            products: includeProducts,
            children: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
