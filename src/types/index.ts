// Product types
export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  // Relations
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

// Blog form data type
export interface BlogFormData {
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  tags: string[];
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

// Blog stats type
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  recentPosts: number;
  topAuthors: Array<{
    id: string;
    name: string;
    email: string;
    postCount: number;
  }>;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}

// Contact form types
export interface ContactForm {
  name: string;
  email: string;
  company?: string;
  message: string;
  subject: string;
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

