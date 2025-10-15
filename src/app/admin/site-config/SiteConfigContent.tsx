'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Save, Settings, Globe, Image as ImageIcon, Phone, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SiteConfig {
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
  navigationItems: any;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  socialLinks?: any;
  footerText?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  hidden?: boolean;
}

interface SocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export default function SiteConfigContent() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/site-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.siteConfig);
        } else {
          setMessage({ type: 'error', text: 'Failed to load site configuration' });
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setMessage({ type: 'error', text: 'Error loading site configuration' });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 更新配置字段
  const updateConfig = (field: string, value: any) => {
    if (config) {
      setConfig({
        ...config,
        [field]: value
      });
    }
  };

  // 更新导航项
  const updateNavigationItem = (index: number, field: 'name' | 'href' | 'hidden', value: string | boolean) => {
    if (config) {
      const navItems = [...(config.navigationItems as NavigationItem[])];
      navItems[index] = { ...navItems[index], [field]: value };
      setConfig({
        ...config,
        navigationItems: navItems
      });
    }
  };

  // 添加导航项
  const addNavigationItem = () => {
    if (config) {
      const navItems = [...(config.navigationItems as NavigationItem[])];
      navItems.push({ name: 'New Item', href: '/new-item', hidden: false });
      setConfig({
        ...config,
        navigationItems: navItems
      });
    }
  };

  // 删除导航项
  const removeNavigationItem = (index: number) => {
    if (config) {
      const navItems = [...(config.navigationItems as NavigationItem[])];
      navItems.splice(index, 1);
      setConfig({
        ...config,
        navigationItems: navItems
      });
    }
  };

  // 更新社交媒体链接
  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    if (config) {
      const socialLinks = { ...(config.socialLinks as SocialLinks) };
      socialLinks[platform] = value;
      setConfig({
        ...config,
        socialLinks
      });
    }
  };

  // 图片上传处理
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'heroImage') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const setUploading = field === 'logo' ? setIsUploadingLogo : setIsUploadingHeroImage;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('images', files[0]);

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.urls && result.urls.length > 0) {
        updateConfig(field, result.urls[0]);
        setMessage({ type: 'success', text: 'Image uploaded successfully' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // 保存配置
  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Site configuration saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error saving configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load site configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Configuration</h1>
          <p className="text-muted-foreground">Manage your website's basic settings and appearance</p>
        </div>
        <Button onClick={saveConfig} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact Info
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Site Information</CardTitle>
              <CardDescription>Configure your website's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => updateConfig('siteName', e.target.value)}
                    placeholder="Your Site Name"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={config.siteDescription || ''}
                    onChange={(e) => updateConfig('siteDescription', e.target.value)}
                    placeholder="Brief description of your site"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Logo</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingLogo}
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        {isUploadingLogo ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="ml-2">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </div>
                    {config.logo && (
                      <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    value={config.footerText || ''}
                    onChange={(e) => updateConfig('footerText', e.target.value)}
                    placeholder="© 2025 Your Company. All rights reserved."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 英雄区域 */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Configure your homepage hero banner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={config.heroTitle}
                    onChange={(e) => updateConfig('heroTitle', e.target.value)}
                    placeholder="Welcome to Your Site"
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={config.heroSubtitle || ''}
                    onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                    placeholder="Your tagline or description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroButtonText">Button Text</Label>
                  <Input
                    id="heroButtonText"
                    value={config.heroButtonText}
                    onChange={(e) => updateConfig('heroButtonText', e.target.value)}
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <Label htmlFor="heroButtonLink">Button Link</Label>
                  <Input
                    id="heroButtonLink"
                    value={config.heroButtonLink}
                    onChange={(e) => updateConfig('heroButtonLink', e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>

              <div>
                <Label>Hero Background Image</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingHeroImage}
                      onClick={() => document.getElementById('hero-image-upload')?.click()}
                    >
                      {isUploadingHeroImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="ml-2">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Hero Image
                        </>
                      )}
                    </Button>
                    <input
                      id="hero-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImage')}
                      className="hidden"
                    />
                  </div>
                  {config.heroImage && (
                    <img src={config.heroImage} alt="Hero" className="h-32 object-cover rounded-md" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 导航配置 */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>Configure your site's navigation items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.navigationItems as NavigationItem[]).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label>Menu Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateNavigationItem(index, 'name', e.target.value)}
                      placeholder="Menu Name"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Link</Label>
                    <Input
                      value={item.href}
                      onChange={(e) => updateNavigationItem(index, 'href', e.target.value)}
                      placeholder="/page-url"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Label className="text-sm">Visible</Label>
                    <Switch
                      checked={!item.hidden}
                      onCheckedChange={(checked) => updateNavigationItem(index, 'hidden', !checked)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeNavigationItem(index)}
                    className="mt-6"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addNavigationItem} variant="outline">
                Add Navigation Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 联系信息 */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Configure your company contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={config.companyName || ''}
                    onChange={(e) => updateConfig('companyName', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={config.companyEmail || ''}
                    onChange={(e) => updateConfig('companyEmail', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={config.companyPhone || ''}
                    onChange={(e) => updateConfig('companyPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={config.companyAddress || ''}
                    onChange={(e) => updateConfig('companyAddress', e.target.value)}
                    placeholder="123 Business Street, City, Country"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={(config.socialLinks as SocialLinks)?.facebook || ''}
                      onChange={(e) => updateSocialLink('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={(config.socialLinks as SocialLinks)?.twitter || ''}
                      onChange={(e) => updateSocialLink('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={(config.socialLinks as SocialLinks)?.linkedin || ''}
                      onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={(config.socialLinks as SocialLinks)?.instagram || ''}
                      onChange={(e) => updateSocialLink('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
