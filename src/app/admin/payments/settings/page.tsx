'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  CreditCard,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentSettings {
  stripeEnabled: boolean;
  stripeLinkEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  linkPersistentToken: boolean;
  linkSaveCards: boolean;
  defaultCurrency: string;
  minimumAmount: number;
  maximumAmount: number;
  allowedCountries: string[];
  requireBillingAddress: boolean;
  collectShippingAddress: boolean;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    stripeLinkEnabled: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    linkPersistentToken: true,
    linkSaveCards: true,
    defaultCurrency: 'USD',
    minimumAmount: 1,
    maximumAmount: 999999,
    allowedCountries: ['US', 'CA', 'GB', 'AU'],
    requireBillingAddress: true,
    collectShippingAddress: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/payments/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        await checkStripeConnection();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const checkStripeConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('/api/admin/payments/test-connection');
      const data = await response.json();
      
      if (response.ok && data.connected) {
        setConnectionStatus('connected');
        setConnectionInfo(data.account);
        toast.success('Stripe connection verified successfully');
      } else {
        setConnectionStatus('error');
        setConnectionError(data.error || 'Connection failed');
        toast.error(data.error || 'Failed to connect to Stripe');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError('Network error occurred');
      toast.error('Network error occurred');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/payments/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Payment settings saved successfully');
        await checkStripeConnection();
      } else {
        toast.error('Failed to save payment settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">
          Configure your payment processing and Stripe Link integration
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Configuration</TabsTrigger>
          <TabsTrigger value="link">Link Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {connectionStatus === 'checking' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Checking connection...</span>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-700">Connected to Stripe</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">Connection failed</span>
                    <Badge variant="destructive">
                      Error
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Payment Settings</CardTitle>
              <CardDescription>
                Basic payment configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Stripe Payments</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow customers to pay using Stripe
                  </div>
                </div>
                <Switch
                  checked={settings.stripeEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, stripeEnabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input
                    id="currency"
                    value={settings.defaultCurrency}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultCurrency: e.target.value })
                    }
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={settings.minimumAmount}
                    onChange={(e) =>
                      setSettings({ ...settings, minimumAmount: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Billing Address</Label>
                  <div className="text-sm text-muted-foreground">
                    Collect billing address from customers
                  </div>
                </div>
                <Switch
                  checked={settings.requireBillingAddress}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireBillingAddress: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Stripe API Configuration
              </CardTitle>
              <CardDescription>
                Configure your Stripe API keys and webhook settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Keep your API keys secure. Never share your secret key publicly.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="publishableKey">Publishable Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="publishableKey"
                    value={settings.stripePublishableKey}
                    onChange={(e) =>
                      setSettings({ ...settings, stripePublishableKey: e.target.value })
                    }
                    placeholder="pk_test_..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.stripePublishableKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="secretKey"
                    type={showSecretKey ? 'text' : 'password'}
                    value={settings.stripeSecretKey}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeSecretKey: e.target.value })
                    }
                    placeholder="sk_test_..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.stripeSecretKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhookSecret"
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={settings.stripeWebhookSecret}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeWebhookSecret: e.target.value })
                    }
                    placeholder="whsec_..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.stripeWebhookSecret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Webhook URL:</strong> {window.location.origin}/api/webhooks/stripe
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-2"
                    onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/stripe`)}
                  >
                    Copy URL
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Stripe Link Configuration
              </CardTitle>
              <CardDescription>
                Configure Stripe Link for faster checkout experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Stripe Link</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow customers to use Link for faster checkout
                  </div>
                </div>
                <Switch
                  checked={settings.stripeLinkEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, stripeLinkEnabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Persistent Token</Label>
                  <div className="text-sm text-muted-foreground">
                    Remember customer email for future Link sessions
                  </div>
                </div>
                <Switch
                  checked={settings.linkPersistentToken}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, linkPersistentToken: checked })
                  }
                  disabled={!settings.stripeLinkEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Save Cards for Future Use</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow customers to save payment methods
                  </div>
                </div>
                <Switch
                  checked={settings.linkSaveCards}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, linkSaveCards: checked })
                  }
                  disabled={!settings.stripeLinkEnabled}
                />
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Link Benefits:</strong> Customers can checkout up to 2x faster with Link, 
                  reducing cart abandonment and improving conversion rates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced payment configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={settings.maximumAmount}
                  onChange={(e) =>
                    setSettings({ ...settings, maximumAmount: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Collect Shipping Address</Label>
                  <div className="text-sm text-muted-foreground">
                    Collect shipping address from customers
                  </div>
                </div>
                <Switch
                  checked={settings.collectShippingAddress}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, collectShippingAddress: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Allowed Countries</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Countries where payments are accepted (comma-separated country codes)
                </div>
                <Input
                  value={settings.allowedCountries.join(', ')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowedCountries: e.target.value.split(',').map(c => c.trim())
                    })
                  }
                  placeholder="US, CA, GB, AU"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadSettings}>
          Reset Changes
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}