'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  ExternalLink
} from 'lucide-react';

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published: boolean;
  showInNav: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
  showInNav: boolean;
  sortOrder: number;
}

export default function PageManagementContent() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    published: true,
    showInNav: true,
    sortOrder: 0,
  });

  // 加载页面列表
  const loadPages = async () => {
    try {
      const response = await fetch(`/api/admin/pages?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages);
      } else {
        setMessage({ type: 'error', text: 'Failed to load pages' });
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      setMessage({ type: 'error', text: 'Error loading pages' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [searchQuery]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      published: true,
      showInNav: true,
      sortOrder: 0,
    });
    setEditingPage(null);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPage ? `/api/admin/pages/${editingPage.id}` : '/api/admin/pages';
      const method = editingPage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingPage ? 'Page updated successfully!' : 'Page created successfully!' 
        });
        setIsDialogOpen(false);
        resetForm();
        loadPages();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save page' });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setMessage({ type: 'error', text: 'Error saving page' });
    }
  };

  // 编辑页面
  const handleEdit = (page: CustomPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      published: page.published,
      showInNav: page.showInNav,
      sortOrder: page.sortOrder,
    });
    setIsDialogOpen(true);
  };

  // 删除页面
  const handleDelete = async (page: CustomPage) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Page deleted successfully!' });
        loadPages();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete page' });
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      setMessage({ type: 'error', text: 'Error deleting page' });
    }
  };

  // 切换发布状态
  const togglePublished = async (page: CustomPage) => {
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !page.published }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Page ${!page.published ? 'published' : 'unpublished'} successfully!` 
        });
        loadPages();
      } else {
        setMessage({ type: 'error', text: 'Failed to update page status' });
      }
    } catch (error) {
      console.error('Error updating page:', error);
      setMessage({ type: 'error', text: 'Error updating page status' });
    }
  };

  // 切换导航显示状态
  const toggleShowInNav = async (page: CustomPage) => {
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showInNav: !page.showInNav }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Page ${!page.showInNav ? 'added to' : 'removed from'} navigation successfully!` 
        });
        loadPages();
      } else {
        setMessage({ type: 'error', text: 'Failed to update navigation status' });
      }
    } catch (error) {
      console.error('Error updating page:', error);
      setMessage({ type: 'error', text: 'Error updating navigation status' });
    }
  };

  // 生成slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 处理标题变化，自动生成slug
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) || prev.slug === '' ? generateSlug(title) : prev.slug
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page Management</h1>
          <p className="text-muted-foreground">Create and manage custom pages for your website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>
                {editingPage ? 'Update the page details below.' : 'Fill in the details to create a new page.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter page title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="page-url-slug"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter page content (HTML supported)"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metaTitle">SEO Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title for search engines"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="metaDescription">SEO Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInNav"
                    checked={formData.showInNav}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInNav: checked }))}
                  />
                  <Label htmlFor="showInNav">Show in Navigation</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPage ? 'Update Page' : 'Create Page'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* 搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>Search Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search pages by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 页面列表 */}
      <Card>
        <CardHeader>
          <CardTitle>Pages ({pages.length})</CardTitle>
          <CardDescription>Manage your custom pages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Navigation</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.published ? 'default' : 'secondary'}>
                        {page.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.showInNav ? 'default' : 'outline'}>
                        {page.showInNav ? 'Visible' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell>{page.sortOrder}</TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          title="View Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(page)}
                          title={page.published ? 'Unpublish' : 'Publish'}
                        >
                          {page.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(page)}
                          title="Edit Page"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page)}
                          title="Delete Page"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && pages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pages found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

