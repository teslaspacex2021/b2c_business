'use client';

import { useEffect, useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';

// 创建一个兼容的ReactQuill包装器
const ReactQuillWrapper = dynamic(
  async () => {
    const { default: ReactQuill } = await import('react-quill');
    
    // 创建一个包装组件来处理React 19兼容性
    const CompatibleReactQuill = ({ forwardedRef, ...props }: any) => {
      return <ReactQuill ref={forwardedRef} {...props} />;
    };
    
    return CompatibleReactQuill;
  },
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-md flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  }
);

// 动态导入CSS
if (typeof window !== 'undefined') {
  import('react-quill/dist/quill.snow.css');
}

interface CompatibleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  height?: string;
  readOnly?: boolean;
}

// 简化的工具栏配置
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

export default function CompatibleRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...",
  label = "Content",
  height = "300px",
  readOnly = false
}: CompatibleRichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  if (!isMounted) {
    return (
      <div>
        {label && <Label>{label}</Label>}
        <div className="mt-2 h-64 bg-gray-50 animate-pulse rounded-md flex items-center justify-center">
          <span className="text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="mt-2">
        <ReactQuillWrapper
          forwardedRef={quillRef}
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={readOnly ? { toolbar: false } : quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ 
            height: height, 
            marginBottom: '50px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}
        />
      </div>
    </div>
  );
}
