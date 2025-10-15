import type { Metadata } from 'next';
import SystemSettings from '@/components/admin/SystemSettings';

export const metadata: Metadata = {
  title: 'Settings - Admin Dashboard',
  description: 'System settings and configuration for the B2B business platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SystemSettings />;
}

