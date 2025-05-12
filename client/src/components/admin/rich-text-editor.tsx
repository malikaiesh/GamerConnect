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
        apiKey="7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj" // Using the provided TinyMCE API key
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
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}