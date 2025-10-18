import type { Metadata } from 'next';
import DownloadsManagementContent from './DownloadsManagementContent';

export const metadata: Metadata = {
  title: 'Download Management - Admin Dashboard',
  description: 'Manage product downloads and access permissions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DownloadsManagementPage() {
  return <DownloadsManagementContent />;
}