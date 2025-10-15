import type { Metadata } from 'next';
import ProductManagementContent from './ProductManagementContent';

export const metadata: Metadata = {
  title: 'Product Management - Admin Dashboard',
  description: 'Manage products for the B2B business platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductsManagement() {
  return <ProductManagementContent />;
}

