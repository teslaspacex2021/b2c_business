import type { Metadata } from 'next';
import DigitalProductsContent from './DigitalProductsContent';

export const metadata: Metadata = {
  title: 'Digital Products - Admin Dashboard',
  description: 'Manage digital products and downloadable files.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DigitalProductsPage() {
  return <DigitalProductsContent />;
}