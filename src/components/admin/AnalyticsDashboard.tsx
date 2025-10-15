'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  MessageSquare,
  FileText,
  Package,
  Building,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Loader2
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    publishedProducts: number;
    totalCategories: number;
    totalUsers: number;
    totalContacts: number;
    totalCustomers: number;
    totalQuotes: number;
    period: number;
  };
  growth: {
    contacts: number;
    quotes: number;
    customers: number;
  };
  recent: {
    contacts: Array<{
      id: string;
      name: string;
      email: string;
      subject: string;
      status: string;
      createdAt: string;
    }>;
    quotes: Array<{
      id: string;
      quoteNumber: string;
      title: string;
      total: number;
      status: string;
      customer: {
        name: string;
        email: string;
        company?: string;
      };
      createdAt: string;
    }>;
  };
  distribution: {
    productsByCategory: Array<{
      name: string;
      count: number;
    }>;
    contactsByStatus: Array<{
      status: string;
      count: number;
    }>;
    quotesByStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  trends: {
    monthly: Array<{
      month: string;
      contacts_count: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/overview?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (growth < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWED: 'bg-blue-100 text-blue-800',
      REPLIED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{data.overview.totalProducts}</p>
                <p className="text-xs text-muted-foreground">
                  {data.overview.publishedProducts} published
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{data.overview.totalCustomers}</p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(data.growth.customers)}
                  <p className={`text-xs ${getGrowthColor(data.growth.customers)}`}>
                    {data.growth.customers > 0 ? '+' : ''}{data.growth.customers}%
                  </p>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{data.overview.totalContacts}</p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(data.growth.contacts)}
                  <p className={`text-xs ${getGrowthColor(data.growth.contacts)}`}>
                    {data.growth.contacts > 0 ? '+' : ''}{data.growth.contacts}%
                  </p>
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quotes</p>
                <p className="text-2xl font-bold">{data.overview.totalQuotes}</p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(data.growth.quotes)}
                  <p className={`text-xs ${getGrowthColor(data.growth.quotes)}`}>
                    {data.growth.quotes > 0 ? '+' : ''}{data.growth.quotes}%
                  </p>
                </div>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.distribution.productsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contact Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Status</CardTitle>
            <CardDescription>Current status of customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.distribution.contactsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {data.distribution.contactsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Latest customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent.contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {data.recent.contacts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent contacts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
            <CardDescription>Latest quote requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent.quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{quote.quoteNumber}</h4>
                    <p className="text-sm text-muted-foreground">{quote.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quote.customer.name} - {quote.customer.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${quote.total.toLocaleString()}</p>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {data.recent.quotes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent quotes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Status Overview</CardTitle>
          <CardDescription>Current status of all quotes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.distribution.quotesByStatus.map((item, index) => (
              <div key={item.status} className="text-center">
                <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  {item.count}
                </div>
                <div className="text-sm text-muted-foreground">{item.status}</div>
                <Progress 
                  value={(item.count / data.overview.totalQuotes) * 100} 
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
