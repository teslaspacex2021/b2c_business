import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      return NextResponse.json({ files: [] });
    }

    // Read all files recursively
    const files = await getAllFiles(uploadsDir);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: filePath } = await request.json();
    
    if (!filePath || !filePath.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    try {
      await fs.unlink(fullPath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<any[]> {
  const files: any[] = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else {
        const stats = await fs.stat(fullPath);
        const relativePath = fullPath.replace(path.join(process.cwd(), 'public'), '');
        
        // Get file extension and determine MIME type
        const ext = path.extname(item.name).toLowerCase();
        let mimeType = 'application/octet-stream';
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          mimeType = `image/${ext.slice(1)}`;
        } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
          mimeType = `video/${ext.slice(1)}`;
        } else if (ext === '.pdf') {
          mimeType = 'application/pdf';
        } else if (['.doc', '.docx'].includes(ext)) {
          mimeType = 'application/msword';
        }
        
        files.push({
          name: item.name,
          path: relativePath.replace(/\\/g, '/'),
          size: stats.size,
          type: mimeType,
          createdAt: stats.birthtime.toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  return files;
}

