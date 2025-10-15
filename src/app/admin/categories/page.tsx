import { Metadata } from 'next';
import CategoryManagementContent from './CategoryManagementContent';

export const metadata: Metadata = {
  title: 'Category Management | Admin',
  description: 'Manage product categories and hierarchical organization',
};

export default function CategoryManagementPage() {
  return <CategoryManagementContent />;
}
