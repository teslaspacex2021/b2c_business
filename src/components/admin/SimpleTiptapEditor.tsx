'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
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
  Link,
  Upload,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SimpleTiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
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
    
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
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

    try {
      new URL(url);
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      toast.success('Link added successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white">
      {/* Hidden file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0"
      >
        <Redo className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="h-8 px-2 text-sm font-medium"
      >
        H1
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="h-8 px-2 text-sm font-medium"
      >
        H2
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="h-8 px-2 text-sm font-medium"
      >
        H3
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className="h-8 w-8 p-0"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className="h-8 w-8 p-0"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className="h-8 w-8 p-0"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className="h-8 w-8 p-0"
      >
        <Code className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="h-8 w-8 p-0"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className="h-8 w-8 p-0"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={addLink}
        className="h-8 w-8 p-0"
      >
        <Link className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      {/* Add button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => imageInputRef.current?.click()}
        disabled={isUploading}
        className="h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <Plus className="w-4 h-4 mr-1" />
        )}
        Add
      </Button>
    </div>
  );
};

export default function SimpleTiptapEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Type something...', 
  className
}: SimpleTiptapEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[400px] p-6',
          'prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:text-gray-700 prose-li:text-gray-700',
          'prose-img:rounded-lg prose-img:shadow-sm',
          className
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            setIsDragOver(false);
            
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
      handleDragEnter: () => {
        setIsDragOver(true);
      },
      handleDragLeave: () => {
        setIsDragOver(false);
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

  const isEmpty = !editor?.getHTML() || editor?.getHTML() === '<p></p>';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      
      <div className="relative">
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300 rounded-lg z-10 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Drop your image here</p>
              <p className="text-blue-500 text-sm">Maximum 5MB each</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">Click to upload</p>
              <p className="text-gray-400 text-sm">or drag and drop</p>
              <p className="text-gray-400 text-xs mt-1">Maximum 3 files, 5MB each</p>
            </div>
          </div>
        )}

        <EditorContent 
          editor={editor} 
          className="min-h-[400px] max-h-[600px] overflow-y-auto"
        />
        
        {!isEmpty && !content && editor?.isEmpty && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
