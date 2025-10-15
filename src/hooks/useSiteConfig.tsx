'use client';

import { useState, useEffect } from 'react';

export interface SiteConfig {
  id: string;
  siteName: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroButtonText: string;
  heroButtonLink: string;
  navigationItems: Array<{
    name: string;
    href: string;
  }>;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  socialLinks?: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  footerText?: string;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/site-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.siteConfig);
        } else {
          setError('Failed to load site configuration');
        }
      } catch (err) {
        console.error('Error fetching site config:', err);
        setError('Error loading site configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
    // Re-run the effect
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/site-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.siteConfig);
        } else {
          setError('Failed to load site configuration');
        }
      } catch (err) {
        console.error('Error fetching site config:', err);
        setError('Error loading site configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }};
}

