'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Mail, 
  Shield, 
  Globe, 
  Settings, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
  Clock,
  FileText
} from 'lucide-react';

interface SystemConfig {
  id?: string;
  // 邮件配置
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  emailFrom?: string;
  emailSecure?: boolean;
  emailEnabled?: boolean;
  
  // SEO配置
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  googleAnalytics?: string;
  googleTagManager?: string;
  sitemap?: boolean;
  robotsTxt?: string;
  
  // 安全配置
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  passwordMinLength?: number;
  passwordRequireSpecial?: boolean;
  loginAttempts?: number;
  lockoutDuration?: number;
  sessionTimeout?: number;
  
  // 系统设置
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  currency?: string;
  language?: string;
  
  // 文件上传配置
  maxFileSize?: number;
  allowedFileTypes?: string;
  uploadPath?: string;
  
  // 备份配置
  autoBackup?: boolean;
  backupFrequency?: string;
  backupRetention?: number;
}

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // 加载系统配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/system-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.systemConfig || {});
        } else {
          setMessage({ type: 'error', text: 'Failed to load system configuration' });
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setMessage({ type: 'error', text: 'Error loading system configuration' });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 更新配置字段
  const updateConfig = (field: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 保存配置
  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'System configuration saved successfully!' });
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

  // 测试邮件配置
  const testEmailConfig = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    setTestingEmail(true);
    try {
      const response = await fetch('/api/admin/system-config/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail,
          useCurrentConfig: false,
          ...config
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Test email sent successfully! Please check your inbox.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error testing email:', error);
      setMessage({ type: 'error', text: 'Error testing email configuration' });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading system configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={saveConfig} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* 通用设置 */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General System Settings</CardTitle>
              <CardDescription>Configure basic system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={config.timezone} onValueChange={(value) => updateConfig('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => updateConfig('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={config.dateFormat} onValueChange={(value) => updateConfig('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={config.timeFormat} onValueChange={(value) => updateConfig('timeFormat', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HH:mm:ss">24-hour (HH:mm:ss)</SelectItem>
                      <SelectItem value="hh:mm:ss A">12-hour (hh:mm:ss AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="language">Default Language</Label>
                <Select value={config.language} onValueChange={(value) => updateConfig('language', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">File Upload Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={Math.round((config.maxFileSize || 10485760) / 1024 / 1024)}
                      onChange={(e) => updateConfig('maxFileSize', parseInt(e.target.value) * 1024 * 1024)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uploadPath">Upload Directory</Label>
                    <Input
                      id="uploadPath"
                      value={config.uploadPath || ''}
                      onChange={(e) => updateConfig('uploadPath', e.target.value)}
                      placeholder="/uploads"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types (comma-separated)</Label>
                  <Input
                    id="allowedFileTypes"
                    value={config.allowedFileTypes || ''}
                    onChange={(e) => updateConfig('allowedFileTypes', e.target.value)}
                    placeholder="jpg,jpeg,png,gif,pdf,doc,docx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 邮件配置 */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailEnabled"
                  checked={config.emailEnabled || false}
                  onCheckedChange={(checked) => updateConfig('emailEnabled', checked)}
                />
                <Label htmlFor="emailEnabled">Enable Email Service</Label>
                {config.emailEnabled && (
                  <Badge variant="secondary" className="ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </div>

              {config.emailEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailHost">SMTP Host</Label>
                      <Input
                        id="emailHost"
                        value={config.emailHost || ''}
                        onChange={(e) => updateConfig('emailHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailPort">SMTP Port</Label>
                      <Input
                        id="emailPort"
                        type="number"
                        value={config.emailPort || 465}
                        onChange={(e) => updateConfig('emailPort', parseInt(e.target.value))}
                        placeholder="465"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailUser">Username</Label>
                      <Input
                        id="emailUser"
                        value={config.emailUser || ''}
                        onChange={(e) => updateConfig('emailUser', e.target.value)}
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailPassword">Password</Label>
                      <Input
                        id="emailPassword"
                        type="password"
                        value={config.emailPassword || ''}
                        onChange={(e) => updateConfig('emailPassword', e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailFrom">From Address</Label>
                      <Input
                        id="emailFrom"
                        value={config.emailFrom || ''}
                        onChange={(e) => updateConfig('emailFrom', e.target.value)}
                        placeholder="noreply@yourdomain.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="emailSecure"
                        checked={config.emailSecure !== false}
                        onCheckedChange={(checked) => updateConfig('emailSecure', checked)}
                      />
                      <Label htmlFor="emailSecure">Use SSL/TLS</Label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-4">Test Email Configuration</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="testEmail">Test Email Address</Label>
                        <Input
                          id="testEmail"
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="test@example.com"
                        />
                      </div>
                      <Button
                        onClick={testEmailConfig}
                        disabled={testingEmail || !testEmail}
                        variant="outline"
                        className="mt-6"
                      >
                        {testingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <TestTube className="w-4 h-4 mr-2" />
                            Send Test Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO配置 */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
              <CardDescription>Configure search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="seoTitle">Default SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={config.seoTitle || ''}
                  onChange={(e) => updateConfig('seoTitle', e.target.value)}
                  placeholder="B2B Business Platform"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">Default SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={config.seoDescription || ''}
                  onChange={(e) => updateConfig('seoDescription', e.target.value)}
                  placeholder="Professional B2B Business Solutions"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">Default Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  value={config.seoKeywords || ''}
                  onChange={(e) => updateConfig('seoKeywords', e.target.value)}
                  placeholder="B2B, business, products, international trade"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={config.googleAnalytics || ''}
                    onChange={(e) => updateConfig('googleAnalytics', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="googleTagManager">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManager"
                    value={config.googleTagManager || ''}
                    onChange={(e) => updateConfig('googleTagManager', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sitemap"
                  checked={config.sitemap !== false}
                  onCheckedChange={(checked) => updateConfig('sitemap', checked)}
                />
                <Label htmlFor="sitemap">Generate XML Sitemap</Label>
              </div>

              <div>
                <Label htmlFor="robotsTxt">Robots.txt Content</Label>
                <Textarea
                  id="robotsTxt"
                  value={config.robotsTxt || ''}
                  onChange={(e) => updateConfig('robotsTxt', e.target.value)}
                  placeholder="User-agent: *&#10;Disallow: /admin&#10;Sitemap: https://yourdomain.com/sitemap.xml"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全配置 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={config.maintenanceMode || false}
                    onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  {config.maintenanceMode && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>

                {config.maintenanceMode && (
                  <div>
                    <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={config.maintenanceMessage || ''}
                      onChange={(e) => updateConfig('maintenanceMessage', e.target.value)}
                      placeholder="Site is under maintenance. Please check back later."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Password Policy</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={config.passwordMinLength || 8}
                      onChange={(e) => updateConfig('passwordMinLength', parseInt(e.target.value))}
                      min="6"
                      max="20"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="passwordRequireSpecial"
                      checked={config.passwordRequireSpecial !== false}
                      onCheckedChange={(checked) => updateConfig('passwordRequireSpecial', checked)}
                    />
                    <Label htmlFor="passwordRequireSpecial">Require Special Characters</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Login Security</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={config.loginAttempts || 5}
                      onChange={(e) => updateConfig('loginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={config.lockoutDuration || 30}
                      onChange={(e) => updateConfig('lockoutDuration', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.sessionTimeout || 1440}
                      onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                      min="30"
                      max="10080"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 备份配置 */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Data Management</CardTitle>
              <CardDescription>Configure automatic backups and data retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  checked={config.autoBackup || false}
                  onCheckedChange={(checked) => updateConfig('autoBackup', checked)}
                />
                <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                {config.autoBackup && (
                  <Badge variant="secondary" className="ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </div>

              {config.autoBackup && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select 
                        value={config.backupFrequency} 
                        onValueChange={(value) => updateConfig('backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="backupRetention">Retention Period (days)</Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        value={config.backupRetention || 30}
                        onChange={(e) => updateConfig('backupRetention', parseInt(e.target.value))}
                        min="7"
                        max="365"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-4">Manual Backup Actions</h4>
                    <div className="flex space-x-4">
                      <Button variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Create Backup Now
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
