import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const downloads = await prisma.productDownload.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            isDigital: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get statistics
    const stats = {
      total: await prisma.productDownload.count(),
      active: await prisma.productDownload.count({ where: { status: 'ACTIVE' } }),
      expired: await prisma.productDownload.count({ where: { status: 'EXPIRED' } }),
      exhausted: await prisma.productDownload.count({ where: { status: 'EXHAUSTED' } }),
      suspended: await prisma.productDownload.count({ where: { status: 'SUSPENDED' } })
    };

    return NextResponse.json({ downloads, stats });

  } catch (error) {
    console.error('Downloads fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, customerId, maxDownloads, expiresAt } = body;

    if (!productId || !customerId) {
      return NextResponse.json(
        { error: 'Product ID and Customer ID are required' },
        { status: 400 }
      );
    }

    // Verify product is digital
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        isDigital: true, 
        downloadLimit: true, 
        downloadExpiry: true 
      }
    });

    if (!product || !product.isDigital) {
      return NextResponse.json(
        { error: 'Product not found or not digital' },
        { status: 400 }
      );
    }

    // Generate secure download token
    const downloadToken = randomBytes(32).toString('hex');

    // Calculate expiry date
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
    } else if (product.downloadExpiry) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + product.downloadExpiry);
    }

    const download = await prisma.productDownload.create({
      data: {
        productId,
        customerId,
        downloadToken,
        maxDownloads: maxDownloads || product.downloadLimit,
        expiresAt: expiryDate,
        status: 'ACTIVE'
      },
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      download
    });

  } catch (error) {
    console.error('Download creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}