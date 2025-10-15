import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/auth-middleware';

// 获取单个客户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contacts: {
          orderBy: { createdAt: 'desc' }
        },
        quotes: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        interactions: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新客户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const { id } = await params;
    const body = await request.json();

    const {
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
      status,
      assignedTo,
      notes,
      description,
      totalOrders,
      totalValue,
      lastOrderDate
    } = body;

    // 检查客户是否存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // 如果邮箱改变了，检查新邮箱是否已被使用
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use by another customer' },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
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
        status,
        assignedTo,
        notes,
        description,
        totalOrders: totalOrders ? parseInt(totalOrders) : undefined,
        totalValue: totalValue ? parseFloat(totalValue) : undefined,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : undefined
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

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 删除客户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const permissionError = await checkPermission(request, 'MANAGE_CONTACTS');
    if (permissionError) return permissionError;

    const { id } = await params;

    // 检查客户是否存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotes: true,
            interactions: true
          }
        }
      }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // 如果客户有相关的报价或互动记录，不允许直接删除
    if (existingCustomer._count.quotes > 0 || existingCustomer._count.interactions > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing quotes or interactions. Please archive instead.' 
        },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
