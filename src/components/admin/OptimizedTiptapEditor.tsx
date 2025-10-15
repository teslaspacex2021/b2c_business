'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Image as ImageIcon,
  Link,
  Youtube,
  Upload,
  Video,
  Loader2,
  X,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OptimizedTiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  maxFileSize?: number; // in MB
  allowedImageTypes?: string[];
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Show optimization info if image was optimized
      if (result.optimized) {
        const savedKB = Math.round((result.originalSize - result.size) / 1024);
        toast.success(`Image uploaded and optimized (saved ${savedKB}KB)`);
      } else {
        toast.success('Image uploaded successfully');
      }
      
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error as Error).message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error as Error).message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB default)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ 
        src: url, 
        alt: file.name,
        title: file.name 
      }).run();
    }
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [editor]);

  const handleVideoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (50MB for videos)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    const url = await uploadVideo(file);
    if (url) {
      // Insert video as HTML with proper controls
      editor.chain().focus().insertContent(`
        <div class="video-wrapper" style="position: relative; margin: 1rem 0;">
          <video controls style="width: 100%; max-width: 640px; height: auto;">
            <source src="${url}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
        </div>
      `).run();
      toast.success('Video uploaded successfully');
    }
    
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [editor]);

  const addImageUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      // Validate URL format
      try {
        new URL(url);
        editor.chain().focus().setImage({ 
          src: url,
          alt: 'Image from URL'
        }).run();
        toast.success('Image added successfully');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Validate URL format
    try {
      new URL(url);
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      toast.success('Link added successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL:');
    if (url && editor) {
      // Extract YouTube video ID
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        editor.chain().focus().insertContent(`
          <div class="youtube-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1rem 0;">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
              frameborder="0" 
              allowfullscreen
              title="YouTube video">
            </iframe>
          </div>
        `).run();
        toast.success('YouTube video added successfully');
      } else {
        toast.error('Invalid YouTube URL. Please use a valid YouTube link.');
      }
    }
  }, [editor]);

  const clearContent = useCallback(() => {
    if (editor && window.confirm('Are you sure you want to clear all content?')) {
      editor.chain().focus().clearContent().run();
      toast.success('Content cleared');
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-3 flex flex-wrap gap-1 bg-gray-50">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Headings */}
      <div className="flex items-center gap-1">
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Media Upload */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading}
          title="Upload Image"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading}
          title="Upload Video"
        >
          <Video className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addImageUrl}
          title="Add Image URL"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          title="Add Link"
        >
          <Link className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addYoutube}
          title="Add YouTube Video"
        >
          <Youtube className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Clear Content */}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearContent}
        title="Clear All Content"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function OptimizedTiptapEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing...', 
  className,
  maxFileSize = 10,
  allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: OptimizedTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      Gapcursor,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
          'prose-img:rounded-lg prose-img:shadow-md',
          className
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            
            // Handle image drop
            const formData = new FormData();
            formData.append('file', file);
            
            fetch('/api/upload/image', {
              method: 'POST',
              body: formData,
            })
            .then(response => response.json())
            .then(result => {
              if (result.url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (coordinates) {
                  const node = schema.nodes.image.create({ 
                    src: result.url, 
                    alt: file.name,
                    title: file.name 
                  });
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                  
                  // Show optimization info if image was optimized
                  if (result.optimized) {
                    const savedKB = Math.round((result.originalSize - result.size) / 1024);
                    toast.success(`Image dropped and optimized (saved ${savedKB}KB)`);
                  } else {
                    toast.success('Image dropped successfully');
                  }
                }
              }
            })
            .catch(error => {
              console.error('Upload error:', error);
              toast.error('Failed to upload dropped image');
            });
            
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (file) {
              const formData = new FormData();
              formData.append('file', file);
              
              fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
              })
              .then(response => response.json())
              .then(result => {
                if (result.url) {
                  editor?.chain().focus().setImage({ 
                    src: result.url, 
                    alt: 'Pasted image',
                    title: 'Pasted image'
                  }).run();
                  
                  // Show optimization info if image was optimized
                  if (result.optimized) {
                    const savedKB = Math.round((result.originalSize - result.size) / 1024);
                    toast.success(`Image pasted and optimized (saved ${savedKB}KB)`);
                  } else {
                    toast.success('Image pasted successfully');
                  }
                }
              })
              .catch(error => {
                console.error('Upload error:', error);
                toast.error('Failed to upload pasted image');
              });
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[300px] max-h-[600px] overflow-y-auto"
        />
        {!content && editor?.isEmpty && (
          <div className="absolute top-4 left-6 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <div>
          {editor && (
            <>
              Content length: {editor.getHTML().replace(/<[^>]*>/g, '').length} characters
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">●</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}
