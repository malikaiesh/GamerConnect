import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FormControl } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

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
  const apiKey = process.env.TINYMCE_API_KEY || '';

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
    <FormControl>
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      <div className={isLoading ? 'hidden' : ''}>
        <Editor
          apiKey={apiKey}
          onInit={(evt, editor) => {
            editorRef.current = editor;
            setIsLoading(false);
          }}
          initialValue={value}
          value={value}
          onEditorChange={(newValue) => onChange(newValue)}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'emoticons'
            ],
            toolbar:
              'undo redo | formatselect | bold italic underline strikethrough | ' +
              'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | link image media | emoticons | help',
            toolbar_mode: 'sliding',
            placeholder,
            content_style: `
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 16px; }
              p { margin: 0 0 1em 0; }
              img { max-width: 100%; height: auto; }
              .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                color: rgba(107, 114, 128, 0.5);
                font-style: italic;
              }
            `,
            file_picker_types: 'image',
            images_upload_url: '/api/upload-image',
            relative_urls: false,
            remove_script_host: false,
            formats: {
              h1: { block: 'h1', classes: 'text-2xl font-bold mb-4 mt-6' },
              h2: { block: 'h2', classes: 'text-xl font-bold mb-3 mt-5' },
              h3: { block: 'h3', classes: 'text-lg font-bold mb-2 mt-4' },
              h4: { block: 'h4', classes: 'text-base font-bold mb-2 mt-4' },
              h5: { block: 'h5', classes: 'text-sm font-bold mb-2 mt-3' },
              h6: { block: 'h6', classes: 'text-xs font-bold mb-2 mt-3' }
            },
            setup: (editor) => {
              editor.on('init', () => {
                if (value) {
                  editor.setContent(value);
                }
              });
            },
            statusbar: false,
            readonly: disabled,
          }}
        />
      </div>
    </FormControl>
  );
}