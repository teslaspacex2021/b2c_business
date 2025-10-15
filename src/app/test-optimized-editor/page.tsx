'use client';

import { useState } from 'react';
import OptimizedTiptapEditor from '@/components/admin/OptimizedTiptapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  ImageIcon, 
  Video, 
  Upload, 
  Zap, 
  CheckCircle, 
  FileImage,
  Palette
} from 'lucide-react';

export default function TestOptimizedEditorPage() {
  const [content, setContent] = useState(`
    <h2>🚀 Welcome to the Optimized Tiptap Editor!</h2>
    <p>This enhanced editor includes:</p>
    <ul>
      <li><strong>Smart Image Optimization</strong> - Automatic compression and resizing</li>
      <li><strong>Drag & Drop Support</strong> - Simply drag images directly into the editor</li>
      <li><strong>Paste Images</strong> - Copy and paste images from clipboard</li>
      <li><strong>Multiple Upload Methods</strong> - File picker, URL input, drag & drop</li>
      <li><strong>Real-time Feedback</strong> - See optimization results instantly</li>
    </ul>
    <blockquote>
      <p>Try uploading an image to see the optimization in action! 📸</p>
    </blockquote>
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Optimized Tiptap Editor
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the enhanced Tiptap editor with smart image optimization, 
          drag & drop support, and advanced upload features.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Smart Upload</h3>
            <p className="text-sm text-muted-foreground">
              Automatic optimization & compression
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <FileImage className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Drag & Drop</h3>
            <p className="text-sm text-muted-foreground">
              Simply drag images into editor
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Palette className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Paste Support</h3>
            <p className="text-sm text-muted-foreground">
              Copy & paste from clipboard
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-semibold">Real-time Feedback</h3>
            <p className="text-sm text-muted-foreground">
              See optimization results instantly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <CardTitle>Rich Text Editor with Image Optimization</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Optimized
              </Badge>
              <Badge variant="outline">
                Sharp Integration
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <OptimizedTiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your content here... You can drag images directly into this editor!"
            className="min-h-[400px]"
          />
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Content length: {content.replace(/<[^>]*>/g, '').length} characters
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Auto-save enabled</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClear}>
                Clear Content
              </Button>
              <Button onClick={handleSave}>
                Save Content
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">📤 Upload Methods</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click the upload button to select files</li>
                <li>• Drag and drop images directly into the editor</li>
                <li>• Copy and paste images from clipboard</li>
                <li>• Add images via URL using the image button</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚡ Optimization Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Automatic image compression (JPEG quality: 85-90%)</li>
                <li>• Smart resizing (max: 1920x1080px)</li>
                <li>• Format optimization (preserves GIF animations)</li>
                <li>• Real-time feedback on file size savings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTML Output */}
      <Card>
        <CardHeader>
          <CardTitle>HTML Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-60">
            {content}
          </pre>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
