import type { Metadata } from 'next';
import ProductsPageContent from './ProductsPageContent';

export const metadata: Metadata = {
  title: 'Products - High-Quality International Trade Solutions',
  description: 'Browse our comprehensive range of high-quality products for international trade. Electronics, machinery, materials and more.',
  keywords: ['products', 'international trade', 'electronics', 'machinery', 'materials', 'B2B'],
  openGraph: {
    title: 'Products - B2B Business',
    description: 'Browse our comprehensive range of high-quality products for international trade.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products - B2B Business',
    description: 'Browse our comprehensive range of high-quality products for international trade.',
  },
};

export default function ProductsPage() {
  return <ProductsPageContent />;
}

