import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.exmail.qq.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER || 'obw@shjtqy.cn',
    pass: process.env.EMAIL_PASSWORD || 'CnEvx3g9CwgEezpc',
  },
};

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// Verify SMTP connection configuration
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to send emails');
    return true;
  } catch (error) {
    console.error('SMTP connection error:', error);
    return false;
  }
};

// Email template types
export interface ContactFormEmail {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

export interface QuoteRequestEmail {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  productName: string;
  productId: string;
  quantity?: string;
  message?: string;
}

// Send contact form email
export const sendContactFormEmail = async (data: ContactFormEmail): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"${data.name}" <${process.env.EMAIL_FROM || emailConfig.auth.user}>`,
      to: process.env.EMAIL_USER || emailConfig.auth.user,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="line-height: 1.6; color: #4b5563;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              This email was sent from the contact form on your B2B Business website.
            </p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${data.name}
        Email: ${data.email}
        ${data.company ? `Company: ${data.company}` : ''}
        Subject: ${data.subject}
        
        Message:
        ${data.message}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact form email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

// Send quote request email
export const sendQuoteRequestEmail = async (data: QuoteRequestEmail): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"${data.name}" <${process.env.EMAIL_FROM || emailConfig.auth.user}>`,
      to: process.env.EMAIL_USER || emailConfig.auth.user,
      subject: `Quote Request: ${data.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Quote Request
          </h2>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Customer Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Product Request</h3>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Product ID:</strong> ${data.productId}</p>
            ${data.quantity ? `<p><strong>Quantity:</strong> ${data.quantity}</p>` : ''}
            ${data.message ? `
              <h4 style="color: #374151; margin-top: 20px;">Additional Message</h4>
              <p style="line-height: 1.6; color: #4b5563;">${data.message.replace(/\n/g, '<br>')}</p>
            ` : ''}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dcfce7; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              This quote request was sent from your B2B Business website.
            </p>
          </div>
        </div>
      `,
      text: `
        New Quote Request
        
        Customer Information:
        Name: ${data.name}
        Email: ${data.email}
        ${data.company ? `Company: ${data.company}` : ''}
        ${data.phone ? `Phone: ${data.phone}` : ''}
        
        Product Request:
        Product: ${data.productName}
        Product ID: ${data.productId}
        ${data.quantity ? `Quantity: ${data.quantity}` : ''}
        
        ${data.message ? `Additional Message:\n${data.message}` : ''}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Quote request email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending quote request email:', error);
    return false;
  }
};

// Send admin notification email
export const sendAdminNotification = async (subject: string, content: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || emailConfig.auth.user,
      to: process.env.EMAIL_USER || emailConfig.auth.user,
      subject: `Admin Notification: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Admin Notification
          </h2>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">${subject}</h3>
            <div style="line-height: 1.6; color: #4b5563;">${content}</div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #991b1b;">
              This is an automated notification from your B2B Business system.
            </p>
          </div>
        </div>
      `,
      text: `
        Admin Notification: ${subject}
        
        ${content.replace(/<[^>]*>/g, '')}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

// Send welcome email for new users
export const sendWelcomeEmail = async (name: string, email: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || emailConfig.auth.user,
      to: email,
      subject: 'Welcome to B2B Business Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to B2B Business!</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Your gateway to global trade opportunities</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #374151; margin-top: 0;">Hello ${name}!</h2>
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Thank you for joining our B2B Business platform. We're excited to help you connect with global trade partners and grow your business.
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Browse our extensive product catalog</li>
                <li>Connect with verified suppliers worldwide</li>
                <li>Request quotes for products you're interested in</li>
                <li>Stay updated with industry insights on our blog</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://b2bbusiness.com/product" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Explore Products
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to <a href="https://b2bbusiness.com/contact" style="color: #2563eb;">contact our support team</a>.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              © 2025 B2B Business Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to B2B Business Platform!
        
        Hello ${name}!
        
        Thank you for joining our B2B Business platform. We're excited to help you connect with global trade partners and grow your business.
        
        What's Next?
        - Browse our extensive product catalog
        - Connect with verified suppliers worldwide
        - Request quotes for products you're interested in
        - Stay updated with industry insights on our blog
        
        Visit our website: https://b2bbusiness.com
        
        If you have any questions, feel free to contact our support team at https://b2bbusiness.com/contact
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send newsletter subscription confirmation email
export const sendNewsletterConfirmation = async (email: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || emailConfig.auth.user,
      to: email,
      subject: 'Newsletter Subscription Confirmed - B2B Business',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Confirmed!</h1>
            <p style="color: #a7f3d0; margin: 10px 0 0 0;">You're now subscribed to our newsletter</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Thank you for subscribing to our newsletter! You'll now receive the latest updates about:
            </p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Industry trends and market insights</li>
                <li>New product launches and updates</li>
                <li>Trade opportunities and partnerships</li>
                <li>Company news and announcements</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              You can unsubscribe at any time by clicking the unsubscribe link in our emails.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              © 2025 B2B Business Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Newsletter Subscription Confirmed!
        
        Thank you for subscribing to our newsletter! You'll now receive the latest updates about:
        
        - Industry trends and market insights
        - New product launches and updates
        - Trade opportunities and partnerships
        - Company news and announcements
        
        You can unsubscribe at any time by clicking the unsubscribe link in our emails.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Newsletter confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending newsletter confirmation email:', error);
    return false;
  }
};

export default transporter;
