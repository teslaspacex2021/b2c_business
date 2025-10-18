'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  File, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface DigitalFile {
  id: string;
  fileName: string;
  displayName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  version?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  product: {
    id: string;
    title: string;
  };
}

interface Product {
  id: string;
  title: string;
  isDigital: boolean;
}

export default function DigitalProductsContent() {
  const [files, setFiles] = useState<DigitalFile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<DigitalFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    productId: '',
    file: null as File | null,
    displayName: '',
    description: '',
    version: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    description: '',
    version: '',
    isActive: true,
    sortOrder: 0
  });

  // Load data
  const loadData = async () => {
    try {
      const [filesRes, productsRes] = await Promise.all([
        fetch('/api/admin/digital-files'),
        fetch('/api/admin/products')
      ]);

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData.files);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Filter only digital products
        const digitalProducts = productsData.products.filter((p: any) => p.isDigital);
        setProducts(digitalProducts);
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

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = selectedProduct === 'All Products' || 
                          file.product.id === selectedProduct;
    return matchesSearch && matchesProduct;
  });

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.productId) {
      toast({
        title: "Error",
        description: "Please select a file and product",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('productId', uploadForm.productId);
      formData.append('displayName', uploadForm.displayName || uploadForm.file.name);
      formData.append('description', uploadForm.description);
      formData.append('version', uploadForm.version);

      const response = await fetch('/api/admin/digital-files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('File uploaded successfully');
        setIsUploadDialogOpen(false);
        setUploadForm({
          productId: '',
          file: null,
          displayName: '',
          description: '',
          version: ''
        });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Upload Failed",
          description: errorData.error || 'Upload failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFile) return;

    try {
      const response = await fetch(`/api/admin/digital-files/${editingFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('File updated successfully');
        setIsEditDialogOpen(false);
        setEditingFile(null);
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
    }
  };

  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/digital-files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('File deleted successfully');
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  // Open edit dialog
  const openEditDialog = (file: DigitalFile) => {
    setEditingFile(file);
    setEditForm({
      displayName: file.displayName,
      description: file.description || '',
      version: file.version || '',
      isActive: file.isActive,
      sortOrder: file.sortOrder
    });
    setIsEditDialogOpen(true);
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <Archive className="w-4 h-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h1 className="text-3xl font-bold text-foreground">Digital Products</h1>
          <p className="text-muted-foreground">Manage downloadable files for digital products</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Digital File</DialogTitle>
              <DialogDescription>
                Upload a file for a digital product
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={uploadForm.productId}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, productId: value })}
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
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setUploadForm({ 
                      ...uploadForm, 
                      file,
                      displayName: file?.name || ''
                    });
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={uploadForm.displayName}
                  onChange={(e) => setUploadForm({ ...uploadForm, displayName: e.target.value })}
                  placeholder="Name shown to users"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="File description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                  placeholder="e.g., 1.0, v2.1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Files</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter(f => f.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Products</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(files.reduce((total, file) => total + file.fileSize, 0))}
            </div>
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
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Products">All Products</SelectItem>
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

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div>
                          <div className="font-medium">{file.displayName}</div>
                          <div className="text-sm text-muted-foreground">{file.fileName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{file.product.title}</div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                    <TableCell>
                      {file.version && (
                        <Badge variant="outline">{file.version}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={file.isActive ? 'default' : 'secondary'}>
                        {file.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(file.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => openEditDialog(file)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Update file information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editDisplayName">Display Name</Label>
              <Input
                id="editDisplayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editVersion">Version</Label>
              <Input
                id="editVersion"
                value={editForm.version}
                onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSortOrder">Sort Order</Label>
              <Input
                id="editSortOrder"
                type="number"
                value={editForm.sortOrder}
                onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editIsActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              />
              <Label htmlFor="editIsActive">Active</Label>
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