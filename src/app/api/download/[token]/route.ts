import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Find download record
    const download = await prisma.productDownload.findUnique({
      where: { downloadToken: token },
      include: {
        product: {
          include: {
            digitalFiles: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!download) {
      return NextResponse.json(
        { error: 'Invalid download token' },
        { status: 404 }
      );
    }

    // Check if download is still valid
    if (download.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Download is no longer available' },
        { status: 403 }
      );
    }

    // Check expiry
    if (download.expiresAt && download.expiresAt < new Date()) {
      await prisma.productDownload.update({
        where: { id: download.id },
        data: { status: 'EXPIRED' }
      });
      
      return NextResponse.json(
        { error: 'Download has expired' },
        { status: 403 }
      );
    }

    // Check download limit
    if (download.maxDownloads && download.downloadCount >= download.maxDownloads) {
      await prisma.productDownload.update({
        where: { id: download.id },
        data: { status: 'EXHAUSTED' }
      });
      
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 }
      );
    }

    // Get the file to download
    const digitalFiles = download.product.digitalFiles;
    if (!digitalFiles || digitalFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files available for download' },
        { status: 404 }
      );
    }

    // For now, download the first file. In a full implementation,
    // you might want to create a ZIP of all files or allow specific file selection
    const fileToDownload = digitalFiles[0];
    
    try {
      const filePath = join(process.cwd(), fileToDownload.filePath);
      const fileBuffer = await readFile(filePath);

      // Update download statistics
      const updateData: any = {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
        ipAddress,
        userAgent
      };

      if (download.downloadCount === 0) {
        updateData.firstDownloadAt = new Date();
      }

      await prisma.productDownload.update({
        where: { id: download.id },
        data: updateData
      });

      // Return file
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': fileToDownload.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileToDownload.displayName}"`,
          'Content-Length': fileToDownload.fileSize.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

    } catch (fileError) {
      console.error('File read error:', fileError);
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}