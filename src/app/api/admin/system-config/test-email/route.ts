import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限
    const permissionError = await checkPermission(request, 'MANAGE_SETTINGS');
    if (permissionError) return permissionError;

    const { testEmail, useCurrentConfig } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    let emailConfig;

    if (useCurrentConfig) {
      // 使用当前保存的配置
      const systemConfig = await prisma.systemConfig.findFirst();
      if (!systemConfig || !systemConfig.emailHost) {
        return NextResponse.json(
          { error: 'No email configuration found' },
          { status: 400 }
        );
      }

      // 解密密码
      let password = '';
      if (systemConfig.emailPassword) {
        // 注意：这里需要实现密码解密逻辑
        // 为了安全，我们可能需要重新输入密码进行测试
        password = systemConfig.emailPassword;
      }

      emailConfig = {
        host: systemConfig.emailHost,
        port: systemConfig.emailPort || 465,
        secure: systemConfig.emailSecure,
        auth: {
          user: systemConfig.emailUser,
          pass: password,
        },
      };
    } else {
      // 使用请求中的配置进行测试
      const { emailHost, emailPort, emailUser, emailPassword, emailSecure } = await request.json();
      
      if (!emailHost || !emailUser || !emailPassword) {
        return NextResponse.json(
          { error: 'Email configuration is incomplete' },
          { status: 400 }
        );
      }

      emailConfig = {
        host: emailHost,
        port: emailPort || 465,
        secure: emailSecure !== false,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      };
    }

    // 创建传输器
    const transporter = nodemailer.createTransporter(emailConfig);

    // 验证连接
    await transporter.verify();

    // 发送测试邮件
    const mailOptions = {
      from: emailConfig.auth.user,
      to: testEmail,
      subject: 'B2B Platform - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Email Configuration Test
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">✅ Success!</h3>
            <p style="margin-bottom: 0;">Your email configuration is working correctly.</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <strong>Test Details:</strong><br>
              • Sent at: ${new Date().toISOString()}<br>
              • From: ${emailConfig.auth.user}<br>
              • Server: ${emailConfig.host}:${emailConfig.port}
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              This is an automated test email from your B2B Business Platform.
            </p>
          </div>
        </div>
      `,
      text: `
        Email Configuration Test
        
        Success! Your email configuration is working correctly.
        
        Test Details:
        - Sent at: ${new Date().toISOString()}
        - From: ${emailConfig.auth.user}
        - Server: ${emailConfig.host}:${emailConfig.port}
        
        This is an automated test email from your B2B Business Platform.
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Email test error:', error);
    
    let errorMessage = 'Failed to send test email';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 400 }
    );
  }
}
