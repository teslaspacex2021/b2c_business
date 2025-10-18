import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { displayName, description, version, isActive, sortOrder } = body;

    const digitalFile = await prisma.digitalFile.update({
      where: { id },
      data: {
        displayName,
        description,
        version,
        isActive,
        sortOrder
      },
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      file: digitalFile
    });

  } catch (error) {
    console.error('Digital file update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get file info before deletion
    const digitalFile = await prisma.digitalFile.findUnique({
      where: { id },
      select: {
        filePath: true,
        fileName: true
      }
    });

    if (!digitalFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const fullPath = join(process.cwd(), digitalFile.filePath);
      await unlink(fullPath);
    } catch (fileError) {
      console.warn('Failed to delete physical file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.digitalFile.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Digital file deleted successfully'
    });

  } catch (error) {
    console.error('Digital file deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}