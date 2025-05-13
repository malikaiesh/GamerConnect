import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FormControl } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number | string;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  height = 400,
  placeholder = 'Enter content here...',
  disabled = false,
}: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_TINYMCE_API_KEY || '');
  
  // Fetch TinyMCE API key from database
  const { data: tinyMceData } = useQuery({
    queryKey: ['/api/api-keys/type/tinymce'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/api-keys/type/tinymce');
        if (!res.ok) return null;
        return res.json();
      } catch (error) {
        console.error('Error fetching TinyMCE API key:', error);
        return null;
      }
    }
  });

  // Update API key when data is loaded
  useEffect(() => {
    if (tinyMceData && tinyMceData.key) {
      setApiKey(tinyMceData.key);
      console.log('TinyMCE API key loaded from database');
    }
  }, [tinyMceData]);
  
  useEffect(() => {
    // Auto-focus workaround for when the editor is initially loaded but hidden
    const timeout = setTimeout(() => {
      if (editorRef.current) {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
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
            menubar: true, // Enable menu bar for more options
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 
              'emoticons', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'template'
            ],
            toolbar1:
              'undo redo | styles | bold italic underline strikethrough | ' +
              'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
              'forecolor backcolor removeformat',
            toolbar2: 
              'link image media | table | charmap emoticons codesample | fullscreen code',
            toolbar_mode: 'wrap',
            // Add specific formats for headings
            style_formats: [
              { title: 'Heading 1', format: 'h1' },
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Paragraph', format: 'p' },
            ],
            placeholder,
            content_style: `
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 16px; }
              p { margin: 0 0 1em 0; }
              img { max-width: 100%; height: auto; }
              h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
              h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
              h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
              h4 { font-size: 1em; font-weight: bold; margin: 1.33em 0; }
              h5 { font-size: 0.83em; font-weight: bold; margin: 1.67em 0; }
              .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                color: rgba(107, 114, 128, 0.5);
                font-style: italic;
              }
            `,
            // Image upload settings
            file_picker_types: 'image media',
            images_upload_url: '/api/upload',
            automatic_uploads: true,
            images_reuse_filename: true,
            relative_urls: false,
            remove_script_host: false,
            
            // Media embed settings
            media_live_embeds: true,
            media_alt_source: false,
            media_poster: false,
            media_dimensions: false,
            
            // Add custom formats for headings with proper styling
            formats: {
              h1: { block: 'h1', classes: 'text-3xl font-bold mb-4 mt-6' },
              h2: { block: 'h2', classes: 'text-2xl font-bold mb-3 mt-5' },
              h3: { block: 'h3', classes: 'text-xl font-bold mb-2 mt-4' },
              h4: { block: 'h4', classes: 'text-lg font-bold mb-2 mt-4' },
              h5: { block: 'h5', classes: 'text-base font-bold mb-2 mt-3' },
            },
            
            // Additional setup
            setup: (editor) => {
              editor.on('init', () => {
                if (value) {
                  editor.setContent(value);
                }
              });
            },
            
            // Other settings
            branding: false,
            resize: true,
            statusbar: true,
            readonly: disabled,
            
            // Quick insert options for common elements
            quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
            quickbars_insert_toolbar: 'quickimage quicktable',
            
            // Image caption and advanced settings
            image_caption: true,
            image_advtab: true,
            
            // Link settings
            link_assume_external_targets: true,
            
            // Context menu
            contextmenu: 'link image table',
          }}
        />
      </div>
    </>
  );
}