import type { Metadata } from 'next';
import { use } from 'react';
import ProductEditContent from './ProductEditContent';

export const metadata: Metadata = {
  title: 'Edit Product - Admin Dashboard',
  description: 'Edit product details and manage product information.',
  robots: {
    index: false,
    follow: false,
  },
};

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = use(params);
  return <ProductEditContent productId={id} />;
}
