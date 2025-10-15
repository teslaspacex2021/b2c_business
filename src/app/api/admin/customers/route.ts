import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    // 获取客户列表
    const customers = await prisma.customer.findMany({
      where,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contacts: {
          select: {
            id: true,
            subject: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            contacts: true,
            quotes: true,
            interactions: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    });

    // 获取总数
    const total = await prisma.customer.count({ where });

    // 获取统计信息
    const stats = {
      total,
      leads: await prisma.customer.count({ where: { type: 'LEAD' } }),
      prospects: await prisma.customer.count({ where: { type: 'PROSPECT' } }),
      customers: await prisma.customer.count({ where: { type: 'CUSTOMER' } }),
      partners: await prisma.customer.count({ where: { type: 'PARTNER' } }),
      active: await prisma.customer.count({ where: { status: 'ACTIVE' } }),
      highPriority: await prisma.customer.count({ where: { priority: 'HIGH' } })
    };

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新客户
export async function POST(request: NextRequest) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      company,
      position,
      website,
      address,
      type = 'LEAD',
      source,
      tags = [],
      priority = 'NORMAL',
      assignedTo,
      notes,
      description
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        website,
        address,
        type,
        source,
        tags,
        priority,
        assignedTo,
        notes,
        description,
        status: 'ACTIVE'
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
