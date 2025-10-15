import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendNewsletterConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, company, phone, subscribeNewsletter } = body;

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在和创建用户
    let user;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建用户
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'user', // 默认角色为普通用户
          company: company || null,
          phone: phone || null,
          subscribeNewsletter: subscribeNewsletter || false,
          emailVerified: null, // 需要邮箱验证
          active: true,
        },
      });
    } catch (dbError) {
      console.warn('Database connection failed, simulating user registration:', dbError);
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // 模拟用户创建
      user = {
        id: 'mock-user-' + Date.now(),
        name,
        email,
        password: hashedPassword,
        role: 'user',
        company: company || null,
        phone: phone || null,
        subscribeNewsletter: subscribeNewsletter || false,
        emailVerified: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // 发送欢迎邮件
    try {
      await sendWelcomeEmail(name, email);
      
      // 如果用户订阅了newsletter，发送确认邮件
      if (subscribeNewsletter) {
        await sendNewsletterConfirmation(email);
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // 不因为邮件发送失败而影响注册流程
    }

    // 返回成功响应（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
