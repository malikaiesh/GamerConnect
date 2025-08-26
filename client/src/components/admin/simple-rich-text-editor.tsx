import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

interface SimpleRichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleRichTextEditor({
  id,
  value,
  onChange,
  label,
  height = 400,
  placeholder = 'Enter content here...',
  disabled = false
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch TinyMCE API key from the database
  const { data: tinyMceApiKey } = useQuery({
    queryKey: ['/api/api-keys/type/tinymce'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/api-keys/type/tinymce');
        if (!res.ok) return null;
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error fetching TinyMCE API key:', error);
        return null;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Get the API key - try database first, then fallback
  const apiKey = tinyMceApiKey?.key || 
                 import.meta.env.VITE_TINYMCE_API_KEY || 
                 '7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj';

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, []);

  const handleEditorInit = (evt: any, editor: any) => {
    editorRef.current = editor;
    setIsInitialized(true);
    console.log('TinyMCE Editor initialized successfully');
  };

  return (
    <div className="space-y-2 w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      
      {!isInitialized && (
        <div className="border rounded-md p-4 bg-muted text-center">
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      )}
      
      <div className={!isInitialized ? 'hidden' : ''}>
        <Editor
          id={id}
          apiKey={apiKey}
          onInit={handleEditorInit}
          initialValue={value}
          value={value}
          onEditorChange={(newValue) => onChange(newValue)}
          init={{
            height,
            menubar: 'file edit view insert format tools table help',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount',
              'emoticons', 'hr', 'codesample'
            ],
            toolbar: [
              'undo redo | formatselect styleselect | bold italic underline strikethrough',
              'alignleft aligncenter alignright alignjustify | outdent indent',
              'numlist bullist | link image media table',
              'emoticons hr codesample | searchreplace code fullscreen | help'
            ].join(' | '),
            style_formats: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Heading 1', format: 'h1' },
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Heading 6', format: 'h6' },
            ],
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #333; }',
            placeholder,
            branding: false,
            promotion: false,
            statusbar: true,
            resize: 'both',
            elementpath: false,
            skin: 'oxide',
            content_css: 'default',
            setup: (editor: any) => {
              editor.on('init', () => {
                console.log('TinyMCE editor ready');
              });
            }
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}