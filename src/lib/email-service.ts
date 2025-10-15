// 邮件服务 - 支持多种邮件提供商
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SupportInquiry {
  sessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  subject?: string;
  message: string;
  timestamp: Date;
  source: string;
  priority: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // 从环境变量获取邮件配置
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.config = emailConfig;
      this.transporter = nodemailer.createTransporter(emailConfig);
    } else {
      console.warn('Email configuration not found. Email notifications will be disabled.');
    }
  }

  // 发送客服咨询通知邮件
  async sendSupportInquiry(inquiry: SupportInquiry): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const template = this.generateSupportInquiryTemplate(inquiry);
      
      const mailOptions = {
        from: `"B2B Business Support" <${this.config.auth.user}>`,
        to: process.env.SUPPORT_EMAIL || 'support@b2bbusiness.com',
        subject: template.subject,
        text: template.text,
        html: template.html,
        replyTo: inquiry.visitorEmail || undefined
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Support inquiry email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending support inquiry email:', error);
      return false;
    }
  }

  // 发送自动回复邮件给客户
  async sendAutoReply(inquiry: SupportInquiry): Promise<boolean> {
    if (!this.transporter || !this.config || !inquiry.visitorEmail) {
      return false;
    }

    try {
      const template = this.generateAutoReplyTemplate(inquiry);
      
      const mailOptions = {
        from: `"B2B Business Support" <${this.config.auth.user}>`,
        to: inquiry.visitorEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending auto-reply email:', error);
      return false;
    }
  }

  // 发送客服回复邮件
  async sendSupportReply(
    customerEmail: string,
    sessionId: string,
    agentName: string,
    message: string
  ): Promise<boolean> {
    if (!this.transporter || !this.config) {
      return false;
    }

    try {
      const template = this.generateSupportReplyTemplate(sessionId, agentName, message);
      
      const mailOptions = {
        from: `"${agentName} - B2B Business Support" <${this.config.auth.user}>`,
        to: customerEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Support reply email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending support reply email:', error);
      return false;
    }
  }

  // 生成客服咨询邮件模板
  private generateSupportInquiryTemplate(inquiry: SupportInquiry): EmailTemplate {
    const subject = `New Support Inquiry: ${inquiry.subject || 'Customer Support Request'}`;
    
    const text = `
New Support Inquiry Received

Session ID: ${inquiry.sessionId}
Timestamp: ${inquiry.timestamp.toLocaleString()}
Priority: ${inquiry.priority}
Source: ${inquiry.source}

Customer Information:
Name: ${inquiry.visitorName || 'Not provided'}
Email: ${inquiry.visitorEmail || 'Not provided'}
Phone: ${inquiry.visitorPhone || 'Not provided'}

Subject: ${inquiry.subject || 'No subject'}

Message:
${inquiry.message}

---
Please reply to this email to respond directly to the customer.
You can also manage this inquiry in the admin panel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/support
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Support Inquiry</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 14px; }
        .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin: 15px 0; }
        .info-label { font-weight: bold; color: #475569; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
        .priority-high { border-left-color: #dc2626; }
        .priority-urgent { border-left-color: #ea580c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎧 New Support Inquiry</h1>
            <p>Session ID: ${inquiry.sessionId}</p>
        </div>
        
        <div class="content">
            <div class="info-grid">
                <div class="info-label">Timestamp:</div>
                <div>${inquiry.timestamp.toLocaleString()}</div>
                
                <div class="info-label">Priority:</div>
                <div><strong>${inquiry.priority}</strong></div>
                
                <div class="info-label">Source:</div>
                <div>${inquiry.source}</div>
                
                <div class="info-label">Customer Name:</div>
                <div>${inquiry.visitorName || 'Not provided'}</div>
                
                <div class="info-label">Email:</div>
                <div>${inquiry.visitorEmail || 'Not provided'}</div>
                
                <div class="info-label">Phone:</div>
                <div>${inquiry.visitorPhone || 'Not provided'}</div>
                
                <div class="info-label">Subject:</div>
                <div>${inquiry.subject || 'No subject'}</div>
            </div>
            
            <div class="message-box ${inquiry.priority === 'HIGH' ? 'priority-high' : inquiry.priority === 'URGENT' ? 'priority-urgent' : ''}">
                <h3>Customer Message:</h3>
                <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Quick Actions:</strong></p>
            <p>• Reply to this email to respond directly to the customer</p>
            <p>• Manage in admin panel: <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support" style="color: #93c5fd;">Admin Dashboard</a></p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  // 生成自动回复邮件模板
  private generateAutoReplyTemplate(inquiry: SupportInquiry): EmailTemplate {
    const subject = `Thank you for contacting B2B Business - We've received your inquiry`;
    
    const text = `
Dear ${inquiry.visitorName || 'Valued Customer'},

Thank you for contacting B2B Business. We have received your inquiry and will respond as soon as possible.

Your Inquiry Details:
Reference ID: ${inquiry.sessionId}
Subject: ${inquiry.subject || 'Support Request'}
Submitted: ${inquiry.timestamp.toLocaleString()}

Our support team typically responds within 24 hours during business hours (Mon-Fri, 9AM-6PM EST).

For urgent matters, you can also contact us at:
Phone: +1 (555) 123-4567
Email: support@b2bbusiness.com

Best regards,
B2B Business Support Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank you for your inquiry</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f0fdf4; padding: 20px; border: 1px solid #bbf7d0; }
        .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Thank You for Your Inquiry</h1>
        </div>
        
        <div class="content">
            <p>Dear ${inquiry.visitorName || 'Valued Customer'},</p>
            
            <p>Thank you for contacting <strong>B2B Business</strong>. We have received your inquiry and will respond as soon as possible.</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3>Your Inquiry Details:</h3>
                <p><strong>Reference ID:</strong> ${inquiry.sessionId}</p>
                <p><strong>Subject:</strong> ${inquiry.subject || 'Support Request'}</p>
                <p><strong>Submitted:</strong> ${inquiry.timestamp.toLocaleString()}</p>
            </div>
            
            <p>Our support team typically responds within <strong>24 hours</strong> during business hours (Mon-Fri, 9AM-6PM EST).</p>
            
            <p>For urgent matters, you can also contact us at:</p>
            <ul>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                <li><strong>Email:</strong> support@b2bbusiness.com</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Best regards,<br><strong>B2B Business Support Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  // 生成客服回复邮件模板
  private generateSupportReplyTemplate(sessionId: string, agentName: string, message: string): EmailTemplate {
    const subject = `Response from ${agentName} - B2B Business Support`;
    
    const text = `
Hello,

${agentName} from B2B Business Support has responded to your inquiry:

${message}

Reference ID: ${sessionId}

If you have any additional questions, please feel free to reply to this email.

Best regards,
${agentName}
B2B Business Support Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Response from B2B Business Support</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1d4ed8; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #475569; color: white; padding: 15px; border-radius: 0 0 8px 8px; }
        .message { background: white; padding: 20px; border-left: 4px solid #1d4ed8; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Response from B2B Business Support</h1>
            <p>Agent: ${agentName}</p>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p><strong>${agentName}</strong> from B2B Business Support has responded to your inquiry:</p>
            
            <div class="message">
                ${message.replace(/\n/g, '<br>')}
            </div>
            
            <p><strong>Reference ID:</strong> ${sessionId}</p>
            
            <p>If you have any additional questions, please feel free to reply to this email.</p>
        </div>
        
        <div class="footer">
            <p>Best regards,<br><strong>${agentName}</strong><br>B2B Business Support Team</p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  // 测试邮件配置
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export { EmailService };
export type { SupportInquiry };
