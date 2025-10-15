'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Globe, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import SocialMediaLinks from '@/components/SocialMediaLinks';

export default function Footer() {
  const { config, loading } = useSiteConfig();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer',
        }),
      });

      const data = await response.json();
      setMessage(data.message);
      
      if (response.ok) {
        setEmail('');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {config?.logo ? (
                <img 
                  src={config.logo} 
                  alt={config.siteName || 'Logo'} 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <span className="text-xl font-bold text-primary">
                {config?.siteName || 'B2B Business'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-6">
              {config?.siteDescription || 'Leading provider of high-quality products for international trade. Connecting businesses worldwide with reliable solutions.'}
            </p>
            <SocialMediaLinks variant="footer" position="footer" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/product" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Product Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/product?category=electronics" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/product?category=machinery" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Machinery
                </Link>
              </li>
              <li>
                <Link href="/product?category=materials" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Materials
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  View All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for the latest industry insights and updates.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-r-none"
                  required
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none px-3"
                  disabled={isLoading || !email.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {message && (
                <p className={`text-xs ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </form>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-muted-foreground text-sm">
              {config?.companyEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span>{config.companyEmail}</span>
                </div>
              )}
              {config?.companyPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>{config.companyPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">
            {config?.footerText || '© 2025 B2B Business. All rights reserved.'}
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
