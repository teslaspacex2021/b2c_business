'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleBlogEditor } from '@/components/forms/SimpleBlogEditor';

interface BlogFormData {
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  tags: string[];
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export default function CreateBlogPost() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BlogFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create blog post');
      }

      const result = await response.json();
      console.log('Blog post created:', result);
      
      // Redirect to blog management page
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/blogs');
  };

  return (
    <SimpleBlogEditor
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
