import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/SessionProvider';
import EnhancedCustomerSupportWidget from '@/components/EnhancedCustomerSupportWidget';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ProductProvider } from '@/contexts/ProductContext';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'B2B Business - International Trade Solutions',
    template: '%s | B2B Business'
  },
  description: 'Leading provider of high-quality products for international trade. Connecting businesses worldwide with reliable solutions.',
  keywords: ['B2B', 'international trade', 'business', 'products', 'export', 'import'],
  authors: [{ name: 'B2B Business' }],
  creator: 'B2B Business',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://b2bbusiness.com',
    title: 'B2B Business - International Trade Solutions',
    description: 'Leading provider of high-quality products for international trade.',
    siteName: 'B2B Business',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B2B Business - International Trade Solutions',
    description: 'Leading provider of high-quality products for international trade.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <LanguageProvider>
            <ProductProvider>
              {isAdminRoute ? (
                children
              ) : (
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <EnhancedCustomerSupportWidget />
                </div>
              )}
            </ProductProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}