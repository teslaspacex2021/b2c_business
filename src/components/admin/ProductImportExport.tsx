'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileText, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProductImportExportProps {
  categories: Array<{ id: string; name: string; }>;
  onImportComplete?: () => void;
}

export default function ProductImportExport({ categories, onImportComplete }: ProductImportExportProps) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportCategory, setExportCategory] = useState('all');
  const [exportStatus, setExportStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipErrors: true
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出功能
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        categoryId: exportCategory,
        status: exportStatus
      });

      const response = await fetch(`/api/admin/products/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Products have been exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResults(null);
    }
  };

  // 解析CSV文件
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const product: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header.toLowerCase()) {
            case 'name':
              product.name = value;
              break;
            case 'slug':
              product.slug = value;
              break;
            case 'description':
              product.description = value;
              break;
            case 'price':
              product.price = parseFloat(value) || 0;
              break;
            case 'compare price':
            case 'compareprice':
              product.comparePrice = value ? parseFloat(value) : null;
              break;
            case 'sku':
              product.sku = value;
              break;
            case 'stock':
              product.stock = parseInt(value) || 0;
              break;
            case 'category':
              product.category = value;
              break;
            case 'status':
              product.status = value.toLowerCase();
              break;
            case 'featured':
              product.featured = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
              break;
            case 'tags':
              product.tags = value ? value.split(',').map(t => t.trim()) : [];
              break;
          }
        });
        
        if (product.name) {
          products.push(product);
        }
      }
    }

    return products;
  };

  // 导入功能
  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const text = await importFile.text();
      let products = [];

      if (importFile.name.endsWith('.csv')) {
        products = parseCSV(text);
      } else if (importFile.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        products = jsonData.products || jsonData;
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      if (products.length === 0) {
        throw new Error('No valid products found in the file.');
      }

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          options: importOptions
        }),
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const results = await response.json();
      setImportResults(results.results);

      toast({
        title: "Import Completed",
        description: `Successfully imported ${results.results.success} products.`,
      });

      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import products.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 1000);
    }
  };

  return (
    <div className="flex gap-2">
      {/* 导出对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Products</DialogTitle>
            <DialogDescription>
              Export your products data in various formats
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      CSV (Comma Separated)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      JSON (Complete Data)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-category">Category Filter</Label>
              <Select value={exportCategory} onValueChange={setExportCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-status">Status Filter</Label>
              <Select value={exportStatus} onValueChange={setExportStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="draft">Draft Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Products'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 导入对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Import products from CSV or JSON files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Select File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: CSV, JSON
              </p>
            </div>

            {importFile && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-existing"
                  checked={importOptions.updateExisting}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, updateExisting: checked as boolean }))
                  }
                />
                <Label htmlFor="update-existing" className="text-sm">
                  Update existing products
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-errors"
                  checked={importOptions.skipErrors}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, skipErrors: checked as boolean }))
                  }
                />
                <Label htmlFor="skip-errors" className="text-sm">
                  Skip products with errors
                </Label>
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            {importResults && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>Total: {importResults.total}</div>
                    <div className="text-green-600">Success: {importResults.success}</div>
                    <div className="text-red-600">Failed: {importResults.failed}</div>
                    {importResults.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">View Errors</summary>
                        <div className="mt-1 text-xs space-y-1">
                          {importResults.errors.slice(0, 5).map((error: string, index: number) => (
                            <div key={`error-${index}`} className="text-red-600">{error}</div>
                          ))}
                          {importResults.errors.length > 5 && (
                            <div className="text-muted-foreground">
                              ... and {importResults.errors.length - 5} more errors
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleImport} 
              disabled={!importFile || isImporting}
              className="w-full"
            >
              {isImporting ? 'Importing...' : 'Import Products'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
