'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Calendar, Eye, BarChart3, Upload, Image as ImageIcon } from 'lucide-react';

// Import Quill dynamically to avoid SSR issues
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-md" />
});

import 'react-quill/dist/quill.snow.css';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().optional(),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageAlt: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  scheduledAt: z.string().optional(),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  metaKeywords: z.array(z.string()).default([]),
  allowComments: z.boolean().default(true),
  readingTime: z.number().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface EnhancedBlogEditorProps {
  initialData?: Partial<BlogFormData & { id?: string; views?: number; likes?: number; shares?: number; }>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'script', 'indent', 'direction',
  'color', 'background', 'align', 'link', 'image', 'video',
  'blockquote', 'code-block'
];

const blogCategories = [
  'Technology',
  'Business',
  'Industry News',
  'Case Studies',
  'How-to Guides',
  'Product Updates',
  'Company News',
  'Insights',
  'Trends',
  'Best Practices'
];

export function EnhancedBlogEditor({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode 
}: EnhancedBlogEditorProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [metaKeywords, setMetaKeywords] = useState<string[]>(initialData?.metaKeywords || []);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [content, setContent] = useState(initialData?.content || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      featuredImage: initialData?.featuredImage || '',
      imageAlt: initialData?.imageAlt || '',
      category: initialData?.category || '',
      tags: initialData?.tags || [],
      published: initialData?.published || false,
      featured: initialData?.featured || false,
      scheduledAt: initialData?.scheduledAt || '',
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      metaKeywords: initialData?.metaKeywords || [],
      allowComments: initialData?.allowComments !== undefined ? initialData.allowComments : true,
      readingTime: initialData?.readingTime || undefined,
    },
  });

  const watchedTitle = watch('title');
  const watchedPublished = watch('published');
  const watchedFeatured = watch('featured');
  const watchedAllowComments = watch('allowComments');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && mode === 'create') {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, mode]);

  // Update form content when Quill content changes
  useEffect(() => {
    setValue('content', content);
    
    // Auto-calculate reading time
    if (content) {
      const wordsPerMinute = 200;
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);
      setValue('readingTime', readingTime);
    }
  }, [content, setValue]);

  // Update tags in form when tags state changes
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  // Update keywords in form when keywords state changes
  useEffect(() => {
    setValue('metaKeywords', metaKeywords);
  }, [metaKeywords, setValue]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !metaKeywords.includes(newKeyword.trim())) {
      setMetaKeywords([...metaKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setMetaKeywords(metaKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('images', files[0]);

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.urls && result.urls.length > 0) {
        setValue('featuredImage', result.urls[0]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'tag' | 'keyword') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'tag') {
        handleAddTag();
      } else {
        handleAddKeyword();
      }
    }
  };

  const onFormSubmit = async (data: BlogFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting blog post:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Write and publish a new blog post' 
              : 'Update your blog post content and settings'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onFormSubmit)} 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Saving...' : (mode === 'create' ? 'Create Post' : 'Update Post')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Enter your blog post title..."
                        className="text-lg"
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="url-friendly-slug"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Auto-generated from title if left empty
                      </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        {...register('excerpt')}
                        placeholder="Brief summary of your post..."
                        rows={3}
                      />
                      {errors.excerpt && (
                        <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>
                      )}
                    </div>

                    {/* Content Editor */}
                    <div>
                      <Label>Content *</Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={content}
                          onChange={setContent}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write your blog post content here..."
                          style={{ height: '400px', marginBottom: '50px' }}
                        />
                      </div>
                      {errors.content && (
                        <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Published</Label>
                      <Switch
                        id="published"
                        checked={watchedPublished}
                        onCheckedChange={(checked) => setValue('published', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Featured</Label>
                      <Switch
                        id="featured"
                        checked={watchedFeatured}
                        onCheckedChange={(checked) => setValue('featured', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowComments">Allow Comments</Label>
                      <Switch
                        id="allowComments"
                        checked={watchedAllowComments}
                        onCheckedChange={(checked) => setValue('allowComments', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="scheduledAt">Schedule Publication</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        {...register('scheduledAt')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={watch('category') || ''}
                      onValueChange={(value) => setValue('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {blogCategories.map(category => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="featuredImage">Featured Image</Label>
                      <div className="flex gap-2">
                        <Input
                          id="featuredImage"
                          {...register('featuredImage')}
                          placeholder="https://example.com/image.jpg"
                          type="url"
                          className="flex-1"
                        />
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploadingImage}
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            {isUploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span className="ml-2">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </>
                            )}
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                      {errors.featuredImage && (
                        <p className="text-sm text-destructive mt-1">{errors.featuredImage.message}</p>
                      )}
                      {watch('featuredImage') && (
                        <div className="mt-2">
                          <img
                            src={watch('featuredImage')}
                            alt="Featured image preview"
                            className="max-w-xs h-32 object-cover rounded-md border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="imageAlt">Alt Text</Label>
                      <Input
                        id="imageAlt"
                        {...register('imageAlt')}
                        placeholder="Describe the image"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newTag">Add Tags</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="newTag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'tag')}
                        placeholder="Enter a tag..."
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div>
                      <Label>Current Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reading Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Reading Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="readingTime">Estimated Reading Time (minutes)</Label>
                    <Input
                      id="readingTime"
                      type="number"
                      {...register('readingTime', { valueAsNumber: true })}
                      placeholder="Auto-calculated"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave empty for auto-calculation based on content
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    {...register('seoTitle')}
                    placeholder={watchedTitle || "Enter SEO title..."}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: 50-60 characters
                  </p>
                  {errors.seoTitle && (
                    <p className="text-sm text-destructive mt-1">{errors.seoTitle.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    {...register('seoDescription')}
                    placeholder="Enter meta description for search engines..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: 150-160 characters
                  </p>
                  {errors.seoDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.seoDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newKeyword">Meta Keywords</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      id="newKeyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'keyword')}
                      placeholder="Enter a keyword..."
                    />
                    <Button type="button" onClick={handleAddKeyword} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {metaKeywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                          {keyword}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {mode === 'edit' && initialData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{initialData.views || 0}</div>
                    <p className="text-xs text-muted-foreground">Total page views</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Likes</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{initialData.likes || 0}</div>
                    <p className="text-xs text-muted-foreground">User likes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shares</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{initialData.shares || 0}</div>
                    <p className="text-xs text-muted-foreground">Social shares</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {mode === 'create' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Analytics will be available after the post is published</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}

