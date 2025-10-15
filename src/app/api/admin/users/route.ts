import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { checkPermission } from '@/lib/auth-middleware';

// GET all users
export async function GET(request: NextRequest) {
  try {
    // 检查用户管理权限
    const permissionError = await checkPermission(request, 'MANAGE_USERS');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (role && role !== 'All Roles') {
      where.role = role.toUpperCase();
    }
    
    if (status && status !== 'All Status') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        _count: {
          select: {
            blogPosts: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const stats = {
      total: await prisma.user.count(),
      admin: await prisma.user.count({ where: { role: 'ADMIN' } }),
      editor: await prisma.user.count({ where: { role: 'EDITOR' } }),
      user: await prisma.user.count({ where: { role: 'USER' } }),
      active: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      inactive: await prisma.user.count({ where: { status: 'INACTIVE' } }),
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    // 检查用户管理权限
    const permissionError = await checkPermission(request, 'MANAGE_USERS');
    if (permissionError) return permissionError;

    const body = await request.json();
    const { email, name, password, role, status } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Email, name, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'EDITOR',
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
