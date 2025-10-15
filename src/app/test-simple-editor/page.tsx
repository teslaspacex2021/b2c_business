'use client';

import { useState } from 'react';
import SimpleTiptapEditor from '@/components/admin/SimpleTiptapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  FileText, 
  Upload, 
  Zap, 
  CheckCircle, 
  Palette,
  MousePointer,
  Keyboard
} from 'lucide-react';

export default function TestSimpleEditorPage() {
  const [content, setContent] = useState(`
    <h1>Getting started</h1>
    <p>Welcome to the <strong>Simple Editor</strong> template! This template integrates <strong>open source</strong> UI components and Tiptap extensions licensed under MIT.</p>
    <p>Integrate it by following the <a href="https://template.tiptap.dev/preview/templates/simple">Tiptap UI Components docs</a> or using our CLI tool.</p>
    <blockquote>
      <p><em>A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown</em> <code>**</code> <em>or use keyboard shortcuts</em> <code>⌘+B</code> <em>for</em> <strong>most</strong> <em>all common markdown marks.</em></p>
    </blockquote>
    <p>Add images, customize alignment, and apply <strong>advanced formatting</strong> to make your content stand out.</p>
  `);

  const handleSave = () => {
    console.log('Content saved:', content);
    alert('Content saved to console!');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Simple Editor Template
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A clean, minimal rich text editor inspired by the official Tiptap Simple Template
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="pt-6">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Drag & Drop</h3>
              <p className="text-sm text-gray-600">
                Simply drag images into the editor
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="pt-6">
              <Keyboard className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <p className="text-sm text-gray-600">
                ⌘+B for bold, ⌘+I for italic
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Auto Optimization</h3>
              <p className="text-sm text-gray-600">
                Images are automatically compressed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-gray-900">Simple Rich Text Editor</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Template Style
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <SimpleTiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Type something..."
            />
            
            <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {content.replace(/<[^>]*>/g, '').length} characters
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Ready</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} size="sm">
                  Clear
                </Button>
                <Button onClick={handleSave} size="sm">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <MousePointer className="w-5 h-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Click the <strong>Add</strong> button to upload images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Drag and drop images directly into the editor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Use keyboard shortcuts for quick formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Type markdown syntax for instant formatting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Bold</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+B</code>
                </div>
                <div className="flex justify-between">
                  <span>Italic</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+I</code>
                </div>
                <div className="flex justify-between">
                  <span>Strikethrough</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+Shift+X</code>
                </div>
                <div className="flex justify-between">
                  <span>Code</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+E</code>
                </div>
                <div className="flex justify-between">
                  <span>Undo</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+Z</code>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">⌘+Y</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HTML Output */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">HTML Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm text-gray-700 max-h-60">
              {content}
            </pre>
          </CardContent>
        </Card>

        <Toaster />
      </div>
    </div>
  );
}
