import { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
  error?: string;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  label,
  height = 500,
  error
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  
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
      <Editor
        id={id}
        apiKey="no-api-key" // We're using the free version which works without a key in development
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
            'image media'
          ],
          toolbar: 
            'undo redo | formatselect | ' +
            'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media | removeformat code | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          images_upload_url: '/api/upload',
          relative_urls: false,
          remove_script_host: false,
          convert_urls: true,
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}