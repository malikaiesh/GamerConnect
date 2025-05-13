import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FormControl } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  height?: number | string;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  id = 'rich-text-editor',
  height = 400,
  placeholder = 'Enter content here...',
  disabled = false,
}: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
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
    }
  });
  
  useEffect(() => {
    // Set API key when data is loaded
    if (tinyMceApiKey && tinyMceApiKey.key) {
      setApiKey(tinyMceApiKey.key);
      console.log('TinyMCE API key loaded from database');
    } else {
      console.log('Using fallback TinyMCE API key');
    }
  }, [tinyMceApiKey]);
  
  useEffect(() => {
    // Cleanup TinyMCE on component unmount
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      <div className={isLoading ? 'hidden' : ''}>
        <Editor
          id={id}
          apiKey={apiKey || import.meta.env.VITE_TINYMCE_API_KEY || '7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj'} 
          onInit={(evt, editor) => {
            editorRef.current = editor;
            setIsLoading(false);
          }}
          initialValue={value}
          value={value}
          onEditorChange={(newValue) => onChange(newValue)}
          init={{
            height,
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
              'image media emoticons hr visualchars nonbreaking'
            ],
            toolbar: [
              { name: 'history', items: ['undo', 'redo'] },
              { name: 'styles', items: ['styleselect'] },
              { name: 'formatting', items: ['bold', 'italic', 'underline', 'strikethrough'] },
              { name: 'alignment', items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify'] },
              { name: 'indentation', items: ['outdent', 'indent'] },
              { name: 'lists', items: ['numlist', 'bullist'] },
              { name: 'insertions', items: ['link', 'image', 'media', 'emoticons', 'hr'] },
              { name: 'tools', items: ['searchreplace', 'code', 'fullscreen'] },
              { name: 'more', items: ['more'] },
            ],
            formats: {
              h1: { block: 'h1' },
              h2: { block: 'h2' },
              h3: { block: 'h3' },
              h4: { block: 'h4' },
              h5: { block: 'h5' },
              h6: { block: 'h6' },
            },
            style_formats: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Heading 1', format: 'h1' },
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Heading 6', format: 'h6' },
            ],
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            image_title: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            images_upload_url: '/api/upload',
            relative_urls: false,
            remove_script_host: false,
            convert_urls: true,
            
            // Additional customization
            placeholder,
            resize: true,
            branding: false,
            promotion: false,
            statusbar: true,
            // Don't set readonly directly as it's not compatible with disabled prop
            // readonly: disabled
          }}
          disabled={disabled}
        />
      </div>
    </>
  );
}