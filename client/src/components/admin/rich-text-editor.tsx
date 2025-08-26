import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  label,
  height = 500,
  error,
  placeholder = 'Enter content here...',
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch TinyMCE API key from the database
  const { data: tinyMceApiKey, isLoading: isKeyLoading } = useQuery({
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
    retry: 1, // Don't retry too many times
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  
  useEffect(() => {
    // Set API key when data is loaded or use fallback immediately
    if (tinyMceApiKey && tinyMceApiKey.key) {
      setApiKey(tinyMceApiKey.key);
      console.log('TinyMCE API key loaded from database:', tinyMceApiKey.key.substring(0, 10) + '...');
    } else if (!isKeyLoading) {
      console.log('Using fallback TinyMCE API key');
      // Use fallback key immediately if API key fetch fails or is not loading
      setApiKey('7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj');
    }
  }, [tinyMceApiKey, isKeyLoading]);
  
  useEffect(() => {
    // Cleanup TinyMCE on component unmount
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2 w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      
      {isLoading && apiKey === null && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      
      <div className={isLoading && apiKey === null ? 'hidden' : ''}>
        <Editor
          id={id}
          apiKey={apiKey || import.meta.env.VITE_TINYMCE_API_KEY || '7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj'} // Try: DB, environment variable, then fallback
          onInit={(evt, editor) => {
            editorRef.current = editor;
            setIsLoading(false);
            console.log('TinyMCE Editor initialized successfully');
          }}
          onLoadContent={() => {
            console.log('TinyMCE content loaded');
          }}
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
              'emoticons', 'hr', 'visualchars', 'nonbreaking', 'template',
              'codesample', 'directionality', 'imagetools', 'quickbars', 'pagebreak'
            ].join(' '),
            toolbar: [
              'undo redo | formatselect styleselect',
              'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent',
              'numlist bullist | link image media',
              'table tableprops tabledelete | tablecellprops tablecellvalign tablecellborderwidth tablecellborderstyle | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
              'emoticons hr codesample | searchreplace code fullscreen'
            ].join(' | '),
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
            file_picker_types: 'image media',
            file_picker_callback: function(cb, value, meta) {
              // Create input element and trigger click
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              
              if (meta.filetype === 'image') {
                input.setAttribute('accept', 'image/*');
              } else if (meta.filetype === 'media') {
                input.setAttribute('accept', 'video/*');
              }
              
              input.onchange = function() {
                if (!input.files || input.files.length === 0) return;
                
                const file = input.files[0];
                const reader = new FileReader();
                
                reader.onload = function() {
                  const id = 'blobid' + (new Date()).getTime();
                  const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache;
                  const base64 = (reader.result as string).split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);
                  
                  cb(blobInfo.blobUri(), { title: file.name });
                };
                
                reader.readAsDataURL(file);
              };
              
              input.click();
            },
            images_upload_url: '/api/upload-image',
            images_upload_handler: function(blobInfo, progress) {
              return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/upload-image');
                
                xhr.upload.onprogress = function(e) {
                  progress(e.loaded / e.total * 100);
                };
                
                xhr.onload = function() {
                  if (xhr.status === 403) {
                    reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
                    return;
                  }
                  
                  if (xhr.status < 200 || xhr.status >= 300) {
                    reject('HTTP Error: ' + xhr.status);
                    return;
                  }
                  
                  try {
                    const json = JSON.parse(xhr.responseText);
                    if (!json || typeof json.location != 'string') {
                      reject('Invalid JSON: ' + xhr.responseText);
                      return;
                    }
                    resolve(json.location);
                  } catch (e) {
                    reject('Invalid JSON: ' + xhr.responseText);
                  }
                };
                
                xhr.onerror = function() {
                  reject('Image upload failed due to a network error.');
                };
                
                const formData = new FormData();
                formData.append('file', blobInfo.blob(), blobInfo.filename());
                
                xhr.send(formData);
              });
            },
            relative_urls: false,
            remove_script_host: false,
            convert_urls: true,
            
            // Table options
            table_advtab: true,
            table_cell_advtab: true,
            table_row_advtab: true,
            table_responsive_width: true,
            
            // Additional customization
            placeholder,
            branding: false,
            promotion: false,
            statusbar: true,
            resize: 'both',
            elementpath: false,
            setup: (editor: any) => {
              editor.on('LoadContent', () => {
                console.log('TinyMCE setup complete');
                setIsLoading(false);
              });
              
              editor.on('init', () => {
                console.log('TinyMCE editor init event fired');
                setIsLoading(false);
              });
            }
          }}
          disabled={disabled}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}