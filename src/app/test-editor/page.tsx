'use client';

import { useState } from 'react';
import EnhancedTiptapEditor from '@/components/admin/EnhancedTiptapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Enhanced Tiptap Editor</strong>!</p><p>This editor supports:</p><ul><li>Rich text formatting</li><li>Image and video uploads</li><li>YouTube embeds</li><li>And much more!</li></ul>');

  const handleSave = () => {
    console.log('Content saved:', content);
    alert('Content saved to console!');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tiptap Editor Test Page</h1>
        <p className="text-muted-foreground">
          Test the enhanced Tiptap editor with image/video upload functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedTiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your content here..."
            className="min-h-[400px]"
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Content length: {content.replace(/<[^>]*>/g, '').length} characters
            </p>
            <Button onClick={handleSave}>
              Save Content
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
            {content}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendered Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
