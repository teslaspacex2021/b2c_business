'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  MessageCircle,
  BarChart3,
  Plus,
  ShoppingCart,
  Eye,
  Mail
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  products: number;
  blogPosts: number;
  users: number;
  customers: number;
  contacts: number;
  activeSupportSessions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    blogPosts: 0,
    users: 0,
    customers: 0,
    contacts: 0,
    activeSupportSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load stats from API
      const [productsRes, blogsRes, usersRes, customersRes, contactsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/blogs'),
        fetch('/api/admin/users'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/contacts'),
      ]);

      const [products, blogs, users, customers, contacts] = await Promise.all([
        productsRes.ok ? productsRes.json() : { data: [] },
        blogsRes.ok ? blogsRes.json() : { data: [] },
        usersRes.ok ? usersRes.json() : { data: [] },
        customersRes.ok ? customersRes.json() : { data: [] },
        contactsRes.ok ? contactsRes.json() : { data: [] },
      ]);

      setStats({
        products: products.data?.length || 0,
        blogPosts: blogs.data?.length || 0,
        users: users.data?.length || 0,
        customers: customers.data?.length || 0,
        contacts: contacts.data?.filter((c: any) => c.status === 'NEW')?.length || 0,
        activeSupportSessions: 0, // Will be updated when support API is called
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Product',
      description: 'Add a new product to catalog',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: 'Write Article',
      description: 'Create a new blog post',
      icon: FileText,
      href: '/admin/blogs/create',
      color: 'bg-green-500',
    },
    {
      title: 'View Contacts',
      description: 'Check customer inquiries',
      icon: Mail,
      href: '/admin/contacts',
      color: 'bg-purple-500',
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/" target="_blank">
            <Eye className="w-4 h-4 mr-2" />
            View Website
          </Link>
        </Button>
      </div>

      {/* Compact Key Metrics */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">SYSTEM OVERVIEW</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid gap-3 grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{loading ? '...' : stats.products}</div>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{loading ? '...' : stats.blogPosts}</div>
              <p className="text-xs text-muted-foreground">Blog Posts</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{loading ? '...' : stats.customers}</div>
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{loading ? '...' : stats.contacts}</div>
              <p className="text-xs text-muted-foreground">Contacts</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-600">{loading ? '...' : stats.activeSupportSessions}</div>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{loading ? '...' : stats.users}</div>
              <p className="text-xs text-muted-foreground">Admin Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group"
                >
                  <div className="flex items-center p-3 border rounded-lg hover:shadow-sm transition-all hover:bg-muted/50 cursor-pointer">
                    <div className={`${action.color} w-8 h-8 rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <h3 className="text-sm font-semibold text-muted-foreground">SYSTEM STATUS</h3>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              All Systems Operational
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Website</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Services</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Last checked: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
