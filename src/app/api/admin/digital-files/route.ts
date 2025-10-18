import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const displayName = formData.get('displayName') as string;
    const description = formData.get('description') as string;
    const version = formData.get('version') as string;

    if (!file || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify product exists and is digital
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isDigital: true, title: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isDigital) {
      return NextResponse.json(
        { error: 'Product is not configured as digital' },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'uploads', 'digital-products', productId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);

    // Read file buffer and calculate hash
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    // Save file to disk
    await writeFile(filePath, buffer);

    // Save file record to database
    const digitalFile = await prisma.digitalFile.create({
      data: {
        productId,
        fileName: file.name,
        displayName: displayName || file.name,
        filePath: `uploads/digital-products/${productId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        fileHash,
        description,
        version,
      },
    });

    return NextResponse.json({
      success: true,
      file: digitalFile
    });

  } catch (error) {
    console.error('Digital file upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const where = productId ? { productId } : {};

    const files = await prisma.digitalFile.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            isDigital: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ files });

  } catch (error) {
    console.error('Digital files fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}