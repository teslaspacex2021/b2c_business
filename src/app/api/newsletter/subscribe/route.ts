import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendNewsletterConfirmation } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source = 'blog' } = body;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 检查是否已经订阅
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { message: 'Email is already subscribed to our newsletter' },
          { status: 409 }
        );
      } else {
        // 重新激活已存在但未激活的订阅
        const confirmToken = crypto.randomBytes(32).toString('hex');
        const unsubscribeToken = crypto.randomBytes(32).toString('hex');

        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            active: true,
            confirmed: false,
            confirmToken,
            unsubscribeToken,
            name: name || existingSubscriber.name,
            source,
            updatedAt: new Date(),
          },
        });

        // 发送确认邮件
        try {
          await sendNewsletterConfirmation(email);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }

        return NextResponse.json(
          { message: 'Subscription reactivated successfully! Please check your email for confirmation.' },
          { status: 200 }
        );
      }
    }

    // 创建新订阅
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        active: true,
        confirmed: false,
        confirmToken,
        unsubscribeToken,
        source,
        tags: ['general'],
      },
    });

    // 发送确认邮件
    try {
      await sendNewsletterConfirmation(email);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // 不因为邮件发送失败而影响订阅流程
    }

    return NextResponse.json(
      {
        message: 'Successfully subscribed! Please check your email for confirmation.',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action'); // 'confirm' or 'unsubscribe'

    if (!token || !action) {
      return NextResponse.json(
        { message: 'Missing token or action parameter' },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      // 确认订阅
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { confirmToken: token },
      });

      if (!subscriber) {
        return NextResponse.json(
          { message: 'Invalid or expired confirmation token' },
          { status: 404 }
        );
      }

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          confirmed: true,
          confirmToken: null, // 清除确认token
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { message: 'Email confirmed successfully! You are now subscribed to our newsletter.' },
        { status: 200 }
      );
    } else if (action === 'unsubscribe') {
      // 取消订阅
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { unsubscribeToken: token },
      });

      if (!subscriber) {
        return NextResponse.json(
          { message: 'Invalid or expired unsubscribe token' },
          { status: 404 }
        );
      }

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          active: false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { message: 'Successfully unsubscribed from our newsletter.' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid action parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Newsletter action error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
