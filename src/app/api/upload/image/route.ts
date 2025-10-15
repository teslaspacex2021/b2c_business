import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const fileName = `${timestamp}_${randomString}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let processedBuffer = buffer;
    let metadata = { width: 0, height: 0, format: file.type };

    // Process image with Sharp (if not GIF to preserve animation)
    if (file.type !== 'image/gif') {
      try {
        const image = sharp(buffer);
        const imageMetadata = await image.metadata();
        
        metadata.width = imageMetadata.width || 0;
        metadata.height = imageMetadata.height || 0;
        metadata.format = `image/${imageMetadata.format}`;

        // Resize if image is too large
        if (imageMetadata.width && imageMetadata.height) {
          if (imageMetadata.width > MAX_WIDTH || imageMetadata.height > MAX_HEIGHT) {
            processedBuffer = await image
              .resize(MAX_WIDTH, MAX_HEIGHT, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ quality: 85 })
              .toBuffer();
          } else {
            // Optimize without resizing
            processedBuffer = await image
              .jpeg({ quality: 90 })
              .toBuffer();
          }
        }
      } catch (sharpError) {
        console.warn('Sharp processing failed, using original file:', sharpError);
        // Fall back to original buffer if Sharp fails
        processedBuffer = buffer;
      }
    }

    // Save processed file
    await writeFile(filePath, processedBuffer);

    // Return file information
    const fileUrl = `/uploads/images/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
      originalName: file.name,
      size: processedBuffer.length,
      originalSize: file.size,
      type: file.type,
      metadata: metadata,
      optimized: processedBuffer.length < buffer.length
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
