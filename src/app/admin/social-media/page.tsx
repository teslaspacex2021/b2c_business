'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ExternalLink, 
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  MessageCircle,
  Send,
  Phone
} from 'lucide-react';

interface SocialMedia {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  active: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  facebook: 'text-blue-600',
  twitter: 'text-sky-500',
  instagram: 'text-pink-600',
  linkedin: 'text-blue-700',
  youtube: 'text-red-600',
  tiktok: 'text-black',
  wechat: 'text-green-600',
  weibo: 'text-red-500',
  telegram: 'text-blue-500',
  whatsapp: 'text-green-500',
  default: 'text-gray-600'
};

export default function SocialMediaPage() {
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // 获取社媒账号列表
  const fetchSocialMedias = async () => {
    try {
      const response = await fetch('/api/admin/social-media');
      const result = await response.json();
      
      if (result.success) {
        setSocialMedias(result.data);
      } else {
        toast.error('获取社媒账号失败');
      }
    } catch (error) {
      console.error('获取社媒账号失败:', error);
      toast.error('获取社媒账号失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialMedias();
  }, []);

  // 更新社媒账号
  const updateSocialMedia = async (id: string, data: Partial<SocialMedia>) => {
    setSaving(id);
    try {
      const response = await fetch(`/api/admin/social-media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // 不显示更新成功提示，由具体的操作函数决定
        // 更新本地状态而不是重新获取，避免覆盖用户正在输入的数据
        setSocialMedias(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        );
      } else {
        toast.error(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    } finally {
      setSaving(null);
    }
  };

  // 切换启用状态
  const toggleActive = async (socialMedia: SocialMedia) => {
    try {
      await updateSocialMedia(socialMedia.id, { active: !socialMedia.active });
      toast.success(socialMedia.active ? '已禁用' : '已启用');
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  // 更新URL
  const updateUrl = async (socialMedia: SocialMedia, url: string) => {
    // 只对明确需要URL的平台进行验证
    const urlRequiredPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'telegram', 'whatsapp'];
    
    if (url && urlRequiredPlatforms.includes(socialMedia.platform.toLowerCase()) && !url.startsWith('http')) {
      toast.error('请输入完整的URL（以http://或https://开头）');
      // 恢复原来的值
      setSocialMedias(prev => 
        prev.map(item => 
          item.id === socialMedia.id 
            ? { ...item, url: socialMedia.url }
            : item
        )
      );
      return;
    }
    
    // 保存URL
    try {
      await updateSocialMedia(socialMedia.id, { url });
      toast.success('链接已保存');
    } catch (error) {
      console.error('保存失败:', error);
      // 恢复原来的值
      setSocialMedias(prev => 
        prev.map(item => 
          item.id === socialMedia.id 
            ? { ...item, url: socialMedia.url }
            : item
        )
      );
    }
  };

  // 切换启用状态（带验证）
  const toggleActiveWithValidation = async (socialMedia: SocialMedia) => {
    if (!socialMedia.active && !socialMedia.url.trim()) {
      toast.error('请先填入链接地址才能启用该平台');
      return;
    }
    await toggleActive(socialMedia);
  };

  // 获取平台图标
  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform.toLowerCase()] || platformIcons.default;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">社媒账号管理</h1>
          <p className="text-muted-foreground">
            管理网站的社交媒体账号链接，开启或关闭各个平台的显示
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>社交媒体平台</CardTitle>
          <CardDescription>
            配置各个社交媒体平台的链接，开启后将在网站前端显示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialMedias.map((socialMedia) => (
              <div key={socialMedia.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`${platformColors[socialMedia.platform] || platformColors.default}`}>
                    {getPlatformIcon(socialMedia.platform)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{socialMedia.name}</h3>
                      <Badge variant={socialMedia.active ? 'default' : 'secondary'}>
                        {socialMedia.active ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {socialMedia.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0 max-w-xs">
                    <Input
                      placeholder="输入链接地址"
                      value={socialMedia.url || ''}
                      onChange={(e) => {
                        // 实时更新本地状态
                        setSocialMedias(prev => 
                          prev.map(item => 
                            item.id === socialMedia.id 
                              ? { ...item, url: e.target.value }
                              : item
                          )
                        );
                      }}
                      onBlur={(e) => {
                        // 失去焦点时保存
                        const currentValue = e.target.value;
                        // 总是尝试保存，因为我们无法准确跟踪原始值
                        if (currentValue.trim() !== '') {
                          updateUrl(socialMedia, currentValue);
                        } else if (socialMedia.url) {
                          // 如果输入为空但原来有值，清空URL
                          updateUrl(socialMedia, '');
                        }
                      }}
                      onKeyDown={(e) => {
                        // 按Enter键保存
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      disabled={saving === socialMedia.id}
                      className="text-sm"
                    />
                  </div>
                  
                  {socialMedia.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <a
                        href={socialMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  {/* 显示位置配置 */}
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={socialMedia.showInHeader}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateSocialMedia(socialMedia.id, { showInHeader: checked });
                            toast.success(checked ? '已在头部显示' : '已从头部移除');
                          } catch (error) {
                            console.error('更新显示位置失败:', error);
                          }
                        }}
                        disabled={saving === socialMedia.id || !socialMedia.active}
                        className="scale-75"
                      />
                      <span>头部</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={socialMedia.showInFooter}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateSocialMedia(socialMedia.id, { showInFooter: checked });
                            toast.success(checked ? '已在底部显示' : '已从底部移除');
                          } catch (error) {
                            console.error('更新显示位置失败:', error);
                          }
                        }}
                        disabled={saving === socialMedia.id || !socialMedia.active}
                        className="scale-75"
                      />
                      <span>底部</span>
                    </div>
                  </div>

                  <Switch
                    checked={socialMedia.active}
                    onCheckedChange={() => toggleActiveWithValidation(socialMedia)}
                    disabled={saving === socialMedia.id}
                  />
                </div>
              </div>
            ))}
          </div>

          {socialMedias.length === 0 && (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">正在加载社媒平台</h3>
              <p className="text-muted-foreground">请稍候...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 在输入框中填写对应社交媒体平台的完整链接地址</p>
          <p>• 只有填写了链接地址的平台才能启用</p>
          <p>• 使用"头部"和"底部"开关来配置平台在网站中的显示位置</p>
          <p>• 使用右侧的主开关来启用或禁用该平台</p>
          <p>• 点击外链图标可以预览链接是否正确</p>
          <p>• 输入完链接后按Enter键或点击其他地方自动保存</p>
        </CardContent>
      </Card>
    </div>
  );
}
