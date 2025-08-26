import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Configure marked for better rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Convert markdown to HTML using sync method
  const htmlContent = marked(content, { async: false }) as string;
  
  // Sanitize the HTML for security
  const sanitizedContent = DOMPurify.sanitize(htmlContent);

  return (
    <div 
      className={`prose prose-base sm:prose-lg dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}