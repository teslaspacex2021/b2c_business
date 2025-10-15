import type { Metadata } from 'next';
import EmailTemplateManagement from '@/components/admin/EmailTemplateManagement';

export const metadata: Metadata = {
  title: 'Email Templates - Admin Dashboard',
  description: 'Manage email templates for automated communications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmailTemplatesPage() {
  return <EmailTemplateManagement />;
}
