import type { Metadata } from 'next';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics - Admin Dashboard',
  description: 'Business analytics and performance metrics for your B2B platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
