import type { Metadata } from 'next';
import CustomerManagement from '@/components/admin/CustomerManagement';

export const metadata: Metadata = {
  title: 'Customer Management - Admin Dashboard',
  description: 'Manage customers, leads, and prospects in your CRM system.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomersPage() {
  return <CustomerManagement />;
}
