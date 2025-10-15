import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

// GET - 测试邮件配置
export async function GET() {
  try {
    const isConfigured = await emailService.testConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        configured: isConfigured,
        host: process.env.SMTP_HOST || 'Not configured',
        port: process.env.SMTP_PORT || 'Not configured',
        user: process.env.SMTP_USER ? '***configured***' : 'Not configured',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@b2bbusiness.com'
      }
    });
  } catch (error) {
    console.error('Error checking email configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check email configuration' },
      { status: 500 }
    );
  }
}

// POST - 发送测试邮件
export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // 创建测试邮件数据
    const testInquiry = {
      sessionId: 'test-' + Date.now(),
      visitorName: 'Test User',
      visitorEmail: testEmail,
      subject: 'Test Email Configuration',
      message: 'This is a test message to verify email configuration is working correctly.',
      timestamp: new Date(),
      source: 'admin-test',
      priority: 'NORMAL'
    };

    const success = await emailService.sendSupportInquiry(testInquiry);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
