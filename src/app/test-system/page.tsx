'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function SystemTestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    { name: 'Products API', url: '/api/products' },
    { name: 'Admin Products API', url: '/api/admin/products' },
    { name: 'Categories API', url: '/api/admin/categories' },
    { name: 'Customers API', url: '/api/admin/customers' },
    { name: 'Digital Files API', url: '/api/admin/digital-files' },
    { name: 'Downloads API', url: '/api/admin/downloads' },
    { name: 'Blog Posts API', url: '/api/admin/blogs' },
    { name: 'Contacts API', url: '/api/admin/contacts' },
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    for (const test of testEndpoints) {
      setTests(prev => [...prev, {
        name: test.name,
        status: 'pending',
        message: 'Testing...'
      }]);

      try {
        const response = await fetch(test.url);
        const data = await response.json();

        if (response.ok) {
          setTests(prev => prev.map(t => 
            t.name === test.name 
              ? {
                  ...t,
                  status: 'success',
                  message: `✓ API responding (${response.status})`,
                  details: `Response: ${JSON.stringify(data).substring(0, 100)}...`
                }
              : t
          ));
        } else {
          setTests(prev => prev.map(t => 
            t.name === test.name 
              ? {
                  ...t,
                  status: 'warning',
                  message: `⚠ API error (${response.status})`,
                  details: data.error || 'Unknown error'
                }
              : t
          ));
        }
      } catch (error) {
        setTests(prev => prev.map(t => 
          t.name === test.name 
            ? {
                ...t,
                status: 'error',
                message: '✗ Connection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
              }
            : t
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">System Test</h1>
        <p className="text-muted-foreground">
          Test the B2C e-commerce system APIs and functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run System Tests'
              )}
            </Button>

            {tests.length > 0 && (
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.name}</h4>
                        <Badge variant={getStatusVariant(test.status) as any}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.message}
                      </p>
                      {test.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Digital Products Feature Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">✅ Completed Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Extended Product model with digital product fields</li>
                  <li>• Added DigitalFile model for file management</li>
                  <li>• Added ProductDownload model for access control</li>
                  <li>• Created digital file upload API</li>
                  <li>• Created secure download API with token-based access</li>
                  <li>• Built admin interface for digital product management</li>
                  <li>• Built admin interface for download management</li>
                  <li>• Updated product form to support digital products</li>
                  <li>• Added download limits and expiry controls</li>
                  <li>• Integrated with existing admin navigation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🔧 Technical Implementation</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Database schema extended with new models</li>
                  <li>• File upload with secure storage</li>
                  <li>• Token-based download authentication</li>
                  <li>• Download tracking and analytics</li>
                  <li>• Permission-based access control</li>
                  <li>• File integrity verification (SHA-256)</li>
                  <li>• Responsive admin interfaces</li>
                  <li>• Error handling and validation</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}