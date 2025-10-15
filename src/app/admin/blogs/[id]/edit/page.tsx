'use client';

import { useState, useEffect, use } from 'react';
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

interface BlogPost extends BlogFormData {
  id: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditBlogPostProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPost({ params }: EditBlogPostProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await fetch(`/api/admin/blogs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const data = await response.json();
        setBlogPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        alert('Failed to load blog post');
        router.push('/admin/blogs');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBlogPost();
  }, [id, router]);

  const handleSubmit = async (data: BlogFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog post');
      }

      const result = await response.json();
      console.log('Blog post updated:', result);
      
      // Redirect to blog management page
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert(error instanceof Error ? error.message : 'Failed to update blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/blogs');
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Blog post not found</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleBlogEditor
      mode="edit"
      initialData={blogPost}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
