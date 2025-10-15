import type { Metadata } from 'next';
import BlogManagementContent from './BlogManagementContent';

export const metadata: Metadata = {
  title: 'Blog Management - Admin Dashboard',
  description: 'Manage blog posts for the B2B business platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogsManagement() {
  return <BlogManagementContent />;
}