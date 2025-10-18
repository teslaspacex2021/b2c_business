'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface ProductDownload {
  id: string;
  downloadToken: string;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'EXHAUSTED';
  firstDownloadAt?: string;
  lastDownloadAt?: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Product {
  id: string;
  title: string;
  isDigital: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function DownloadsManagementContent() {
  const [downloads, setDownloads] = useState<ProductDownload[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<ProductDownload | null>(null);
  const [stats, setStats] = useState<any>({});

  // Create form state
  const [createForm, setCreateForm] = useState({
    productId: '',
    customerId: '',
    maxDownloads: '',
    expiresAt: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: 'ACTIVE' as const,
    maxDownloads: '',
    expiresAt: ''
  });

  // Load data
  const loadData = async () => {
    try {
      const [downloadsRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/admin/downloads'),
        fetch('/api/admin/products'),
        fetch('/api/admin/customers')
      ]);

      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json();
        setDownloads(downloadsData.downloads);
        setStats(downloadsData.stats);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Filter only digital products
        const digitalProducts = productsData.products.filter((p: any) => p.isDigital);
        setProducts(digitalProducts);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter downloads
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         download.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         download.customer?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || download.status === selectedStatus.toUpperCase();
    const matchesProduct = selectedProduct === 'all' || download.product.id === selectedProduct;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Handle create download
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.productId || !createForm.customerId) {
      toast({
        title: "Error",
        description: "Please select product and customer",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Download access created successfully"
        });
        setIsCreateDialogOpen(false);
        setCreateForm({
          productId: '',
          customerId: '',
          maxDownloads: '',
          expiresAt: ''
        });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Creation failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: "Error",
        description: "Creation failed",
        variant: "destructive"
      });
    }
  };

  // Handle edit download
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDownload) return;

    try {
      const response = await fetch(`/api/admin/downloads/${editingDownload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Download updated successfully"
        });
        setIsEditDialogOpen(false);
        setEditingDownload(null);
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Update failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive"
      });
    }
  };

  // Handle delete download
  const handleDelete = async (downloadId: string) => {
    if (!confirm('Are you sure you want to revoke this download access?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/downloads/${downloadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Download access revoked successfully"
        });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Delete failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive"
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (download: ProductDownload) => {
    setEditingDownload(download);
    setEditForm({
      status: download.status,
      maxDownloads: download.maxDownloads?.toString() || '',
      expiresAt: download.expiresAt ? new Date(download.expiresAt).toISOString().split('T')[0] : ''
    });
    setIsEditDialogOpen(true);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'EXPIRED': return 'secondary';
      case 'SUSPENDED': return 'destructive';
      case 'EXHAUSTED': return 'outline';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle2 className="w-3 h-3" />;
      case 'EXPIRED': return <Clock className="w-3 h-3" />;
      case 'SUSPENDED': return <Pause className="w-3 h-3" />;
      case 'EXHAUSTED': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Download Management</h1>
          <p className="text-muted-foreground">Manage customer download access and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Grant Download Access</DialogTitle>
              <DialogDescription>
                Create download access for a customer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Digital Product</Label>
                  <Select
                    value={createForm.productId}
                    onValueChange={(value) => setCreateForm({ ...createForm, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a digital product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={createForm.customerId}
                    onValueChange={(value) => setCreateForm({ ...createForm, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxDownloads">Max Downloads</Label>
                  <Input
                    id="maxDownloads"
                    type="number"
                    value={createForm.maxDownloads}
                    onChange={(e) => setCreateForm({ ...createForm, maxDownloads: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires On</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={createForm.expiresAt}
                    onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Grant Access
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exhausted</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exhausted || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Pause className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="exhausted">Exhausted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Downloads ({filteredDownloads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Download</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{download.product.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {download.customer ? (
                        <div>
                          <div className="font-medium">{download.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{download.customer.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No customer</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(download.status) as any} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(download.status)}
                        {download.status.charAt(0) + download.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {download.downloadCount}
                        {download.maxDownloads && ` / ${download.maxDownloads}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {download.expiresAt ? (
                        <div className="text-sm">
                          {new Date(download.expiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {download.lastDownloadAt ? (
                        <div className="text-sm">
                          {new Date(download.lastDownloadAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(download.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(download)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(download.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Download Access</DialogTitle>
            <DialogDescription>
              Update download settings and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editMaxDownloads">Max Downloads</Label>
                <Input
                  id="editMaxDownloads"
                  type="number"
                  value={editForm.maxDownloads}
                  onChange={(e) => setEditForm({ ...editForm, maxDownloads: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editExpiresAt">Expires On</Label>
                <Input
                  id="editExpiresAt"
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}