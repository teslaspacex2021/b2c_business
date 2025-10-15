'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  ExternalLink,
  MessageCircle,
  Send,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialMedia {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  sortOrder: number;
}

interface SocialMediaLinksProps {
  className?: string;
  variant?: 'default' | 'footer' | 'header';
  showLabels?: boolean;
  position?: 'header' | 'footer' | 'both';
}

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Globe,
  wechat: MessageCircle,
  weibo: Globe,
  telegram: Send,
  whatsapp: Phone,
  default: Globe
};

const platformColors: Record<string, string> = {
  facebook: 'hover:text-blue-600',
  twitter: 'hover:text-sky-500',
  instagram: 'hover:text-pink-600',
  linkedin: 'hover:text-blue-700',
  youtube: 'hover:text-red-600',
  tiktok: 'hover:text-black',
  wechat: 'hover:text-green-600',
  weibo: 'hover:text-red-500',
  telegram: 'hover:text-blue-500',
  whatsapp: 'hover:text-green-500',
  default: 'hover:text-primary'
};

export default function SocialMediaLinks({ 
  className = '', 
  variant = 'default',
  showLabels = false,
  position = 'both'
}: SocialMediaLinksProps) {
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchSocialMedias = async () => {
      try {
        const response = await fetch('/api/social-media');
        const result = await response.json();
        
        if (result.success) {
          // 根据position筛选数据
          const filteredData = result.data.filter((item: any) => {
            if (position === 'header') return item.showInHeader;
            if (position === 'footer') return item.showInFooter;
            return item.showInHeader || item.showInFooter; // both
          });
          setSocialMedias(filteredData);
        }
      } catch (error) {
        console.error('获取社媒账号失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMedias();
  }, [mounted, position]);

  if (!mounted || loading || socialMedias.length === 0) {
    return null;
  }

  const getPlatformIcon = (platform: string, size: string = 'w-5 h-5') => {
    const IconComponent = platformIcons[platform.toLowerCase()] || platformIcons.default;
    return <IconComponent className={size} />;
  };

  const getPlatformColor = (platform: string) => {
    return platformColors[platform.toLowerCase()] || platformColors.default;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return 'flex items-center space-x-4';
      case 'header':
        return 'flex items-center space-x-2';
      default:
        return 'flex items-center space-x-3';
    }
  };

  const getButtonSize = () => {
    switch (variant) {
      case 'footer':
        return 'w-8 h-8';
      case 'header':
        return 'w-6 h-6';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'footer':
        return 'w-4 h-4';
      case 'header':
        return 'w-3 h-3';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <TooltipProvider>
      <div className={`${getVariantStyles()} ${className}`}>
        {socialMedias.map((socialMedia) => (
          <Tooltip key={socialMedia.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  ${getButtonSize()} 
                  p-0 
                  text-muted-foreground 
                  ${getPlatformColor(socialMedia.platform)}
                  transition-colors
                `}
                asChild
              >
                <Link
                  href={socialMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  {getPlatformIcon(socialMedia.platform, getIconSize())}
                  {showLabels && (
                    <span className="ml-2 text-sm">{socialMedia.name}</span>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center space-x-2">
                <span>{socialMedia.name}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
