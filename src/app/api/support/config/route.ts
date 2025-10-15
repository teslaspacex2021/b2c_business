import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 更新配置的请求体验证
const updateConfigSchema = z.object({
  enabled: z.boolean().optional(),
  welcomeMessage: z.string().optional(),
  offlineMessage: z.string().optional(),
  autoAssignment: z.boolean().optional(),
  maxSessionsPerAgent: z.number().min(1).max(20).optional(),
  emailNotifications: z.boolean().optional(),
  soundNotifications: z.boolean().optional(),
  allowFileUpload: z.boolean().optional(),
  maxFileSize: z.number().min(1024).max(50 * 1024 * 1024).optional(), // 1KB to 50MB
  allowedFileTypes: z.array(z.string()).optional(),
  enableRating: z.boolean().optional(),
  ratingRequired: z.boolean().optional(),
  sessionTimeout: z.number().min(300).max(7200).optional(), // 5 minutes to 2 hours
});

// GET - 获取客服配置
export async function GET() {
  try {
    let config = await prisma.supportConfig.findFirst();
    
    // 如果没有配置，创建默认配置
    if (!config) {
      config = await prisma.supportConfig.create({
        data: {
          enabled: true,
          welcomeMessage: "Hello! How can we help you today?",
          offlineMessage: "We're currently offline. Please leave a message and we'll get back to you.",
          autoAssignment: true,
          maxSessionsPerAgent: 5,
          emailNotifications: true,
          soundNotifications: true,
          allowFileUpload: true,
          maxFileSize: 10485760, // 10MB
          allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
          enableRating: true,
          ratingRequired: false,
          sessionTimeout: 1800 // 30 minutes
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching support config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PUT - 更新客服配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    // 获取现有配置或创建新配置
    let config = await prisma.supportConfig.findFirst();
    
    if (config) {
      // 更新现有配置
      config = await prisma.supportConfig.update({
        where: { id: config.id },
        data: validatedData
      });
    } else {
      // 创建新配置
      config = await prisma.supportConfig.create({
        data: {
          enabled: true,
          welcomeMessage: "Hello! How can we help you today?",
          offlineMessage: "We're currently offline. Please leave a message and we'll get back to you.",
          autoAssignment: true,
          maxSessionsPerAgent: 5,
          emailNotifications: true,
          soundNotifications: true,
          allowFileUpload: true,
          maxFileSize: 10485760,
          allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
          enableRating: true,
          ratingRequired: false,
          sessionTimeout: 1800,
          ...validatedData
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error updating support config:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
