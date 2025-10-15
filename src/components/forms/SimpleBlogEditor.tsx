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
import { X } from 'lucide-react';
import SimpleTiptapEditor from '@/components/admin/SimpleTiptapEditor';
import { Toaster } from 'sonner';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface SimpleBlogEditorProps {
  initialData?: Partial<BlogFormData & { id?: string }>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function SimpleBlogEditor({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode 
}: SimpleBlogEditorProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState<string>(initialData?.content || '');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      featuredImage: initialData?.featuredImage || '',
      tags: initialData?.tags || [],
      published: initialData?.published || false,
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
    },
  });

  const watchedTitle = watch('title');
  const watchedPublished = watch('published');

  // Update tags in form when tags state changes
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  // Update content in form when content state changes
  useEffect(() => {
    setValue('content', content);
  }, [content, setValue]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </h1>
          <p className="text-gray-600">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
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
                        <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Excerpt */}
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        {...register('excerpt')}
                        placeholder="Brief summary of your post (optional)..."
                        rows={3}
                      />
                      {errors.excerpt && (
                        <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <SimpleTiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your blog post content here..."
                        className="min-h-[400px]"
                      />
                      {errors.content && (
                        <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Use the rich text editor to format your content with headings, lists, images, videos, and more.
                      </p>
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
                    <p className="text-sm text-gray-500">
                      {watchedPublished 
                        ? 'This post will be visible to the public' 
                        : 'This post will be saved as a draft'
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="featuredImage">Image URL</Label>
                      <Input
                        id="featuredImage"
                        {...register('featuredImage')}
                        placeholder="https://example.com/image.jpg"
                        type="url"
                      />
                      {errors.featuredImage && (
                        <p className="text-sm text-red-600 mt-1">{errors.featuredImage.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
                          onKeyPress={handleKeyPress}
                          placeholder="Enter a tag..."
                        />
                        <Button type="button" onClick={handleAddTag} variant="outline">
                          Add
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Additional settings will be available in future updates
                </div>
              </CardContent>
            </Card>
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
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: 50-60 characters
                  </p>
                  {errors.seoTitle && (
                    <p className="text-sm text-red-600 mt-1">{errors.seoTitle.message}</p>
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
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: 150-160 characters
                  </p>
                  {errors.seoDescription && (
                    <p className="text-sm text-red-600 mt-1">{errors.seoDescription.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
      <Toaster />
    </div>
  );
}

