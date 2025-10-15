'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

// Import Quill dynamically to avoid SSR issues
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-md" />
});

import 'react-quill/dist/quill.snow.css';

interface ProductRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  height?: string;
}

// Simplified toolbar for product descriptions
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'indent',
  'color', 'background', 'align', 'link'
];

export default function ProductRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter product description...",
  label = "Description",
  height = "300px"
}: ProductRichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2">
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          style={{ height: height, marginBottom: '50px' }}
        />
      </div>
    </div>
  );
}

