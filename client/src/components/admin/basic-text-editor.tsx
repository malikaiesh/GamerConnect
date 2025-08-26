import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bold, Italic, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface BasicTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function BasicTextEditor({
  id,
  value,
  onChange,
  label,
  height = 400,
  placeholder = 'Enter content here...',
  disabled = false
}: BasicTextEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setSelectionStart(target.selectionStart);
    setSelectionEnd(target.selectionEnd);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', before: '**', after: '**' },
    { icon: Italic, label: 'Italic', before: '*', after: '*' },
    { icon: List, label: 'Bullet List', before: '\n- ', after: '' },
    { icon: ListOrdered, label: 'Numbered List', before: '\n1. ', after: '' },
    { icon: Link, label: 'Link', before: '[', after: '](url)' },
    { icon: Image, label: 'Image', before: '![alt text](', after: ')' },
  ];

  const headingButtons = [
    { label: 'H1', before: '# ', after: '' },
    { label: 'H2', before: '## ', after: '' },
    { label: 'H3', before: '### ', after: '' },
  ];

  return (
    <div className="space-y-2 w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      
      {/* Formatting Toolbar */}
      <div className="border rounded-md p-2 bg-muted/50 flex flex-wrap gap-1">
        {headingButtons.map((btn) => (
          <Button
            key={btn.label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText(btn.before, btn.after)}
            className="h-8 px-2"
          >
            {btn.label}
          </Button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {formatButtons.map((btn) => (
          <Button
            key={btn.label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText(btn.before, btn.after)}
            className="h-8 w-8 p-0"
            title={btn.label}
          >
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      
      {/* Text Area */}
      <Textarea
        id={id}
        value={value}
        onChange={handleTextareaChange}
        onSelect={handleSelection}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[300px] font-mono text-sm"
        style={{ height: `${height}px` }}
      />
      
      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <p>Markdown formatting supported:</p>
        <p>**bold**, *italic*, # heading, - list, [link](url), ![image](url)</p>
      </div>
    </div>
  );
}