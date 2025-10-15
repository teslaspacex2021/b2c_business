'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Send, 
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface EmailConfig {
  configured: boolean;
  host: string;
  port: string;
  user: string;
  supportEmail: string;
}

export default function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-config');
      if (response.ok) {
        const result = await response.json();
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;

    try {
      setTestLoading(true);
      setTestResult(null);
      
      const response = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.success ? result.message : result.error
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to send test email'
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Configuration</h1>
          <p className="text-gray-600">Configure and test email notifications for customer support</p>
        </div>
        <Button variant="outline" onClick={loadConfig}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Status
          </CardTitle>
          <CardDescription>
            Current email configuration and connection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Service Status:</span>
              <Badge variant={config?.configured ? 'default' : 'destructive'}>
                {config?.configured ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configured
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Configured
                  </>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">SMTP Host</Label>
                <p className="text-sm text-gray-600">{config?.host}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">SMTP Port</Label>
                <p className="text-sm text-gray-600">{config?.port}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">SMTP User</Label>
                <p className="text-sm text-gray-600">{config?.user}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Support Email</Label>
                <p className="text-sm text-gray-600">{config?.supportEmail}</p>
              </div>
            </div>

            {!config?.configured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Email service is not configured. Please set the following environment variables:
                  <ul className="mt-2 ml-4 list-disc text-sm">
                    <li><code>SMTP_HOST</code> - SMTP server hostname</li>
                    <li><code>SMTP_PORT</code> - SMTP server port (usually 587)</li>
                    <li><code>SMTP_USER</code> - SMTP username/email</li>
                    <li><code>SMTP_PASS</code> - SMTP password</li>
                    <li><code>SUPPORT_EMAIL</code> - Email to receive support inquiries</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      {config?.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Email
            </CardTitle>
            <CardDescription>
              Send a test email to verify the configuration is working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address to send test email"
                />
              </div>

              <Button 
                onClick={sendTestEmail}
                disabled={!testEmail || testLoading}
                className="w-full"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            The system uses the following email templates for customer support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Support Inquiry Notification</h4>
                <p className="text-sm text-gray-600">Sent to support team when customer submits inquiry</p>
              </div>
              <Badge variant="outline">Internal</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Auto-Reply to Customer</h4>
                <p className="text-sm text-gray-600">Automatic confirmation sent to customer</p>
              </div>
              <Badge variant="outline">Customer</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Agent Reply</h4>
                <p className="text-sm text-gray-600">Sent when support agent replies to customer</p>
              </div>
              <Badge variant="outline">Customer</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
