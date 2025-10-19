'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function HeroSection() {
  const { config, loading } = useSiteConfig();

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-4 w-48 mx-auto"></div>
              <div className="h-16 bg-white/20 rounded mb-6 w-full max-w-4xl mx-auto"></div>
              <div className="h-6 bg-white/20 rounded mb-8 w-full max-w-3xl mx-auto"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="h-12 bg-white/20 rounded w-48"></div>
                <div className="h-12 bg-white/20 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white"
      style={{
        backgroundImage: config?.heroImage 
          ? `linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url(${config.heroImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {!config?.heroImage && (
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
            🛍️ Premium Consumer Products
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {config?.heroTitle || 'Your Gateway to Quality Products'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            {config?.heroSubtitle || 'Discover premium consumer products with reliable quality and exceptional service for modern living'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              <Link href={config?.heroButtonLink || '/product'}>
                {config?.heroButtonText || 'Explore Products'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
              <Link href="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

