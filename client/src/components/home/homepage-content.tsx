import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { HomePageContent } from "@shared/schema";
import { ChevronDown, ChevronUp, Plus, ArrowDown } from "lucide-react";

interface HomePageContentResponse {
  contents: HomePageContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function HomepageContent() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  
  const { 
    data, 
    isLoading, 
    error
  } = useQuery<HomePageContentResponse>({
    queryKey: ['/api/homepage-content/active', { page, limit: 2 }],
  });

  // Toggle expanded state for a specific content block
  const toggleExpanded = (id: number) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Function to format text (bold)
  const formatText = (text: string) => {
    // Bold text: **text** -> <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Process paragraphs into formatted content
  const processParagraphs = (paragraphs: string[]) => {
    return paragraphs.map((paragraph, idx) => {
      // Check for headings
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {formatText(paragraph.substring(2))}
          </h2>
        );
      }
      
      // Check for subheadings
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xl font-semibold mt-5 mb-3 text-foreground">
            {formatText(paragraph.substring(3))}
          </h3>
        );
      }
      
      // Check for FAQ questions
      if (paragraph.startsWith('Q: ')) {
        return (
          <div key={idx} className="font-medium text-lg mt-4 mb-2 text-foreground">
            {formatText(paragraph)}
          </div>
        );
      }
      
      // Check for FAQ answers
      if (paragraph.startsWith('A: ')) {
        return (
          <div key={idx} className="pl-4 border-l-2 border-primary/30 mb-6 text-muted-foreground">
            <div dangerouslySetInnerHTML={{ __html: formatText(paragraph) }} />
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={idx} className="text-base leading-relaxed text-muted-foreground mb-4">
          <div dangerouslySetInnerHTML={{ __html: formatText(paragraph) }} />
        </div>
      );
    });
  };

  // Function to count content elements (paragraphs and divs)
  const countContentElements = (content: string) => {
    // Count <p> tags and <div> tags that contain meaningful content
    const pTagCount = (content.match(/<p[^>]*>/g) || []).length;
    const divWithContentCount = (content.match(/<div[^>]*>[\s\S]*?<\/div>/g) || []).filter(div => 
      div.includes('<p>') || div.includes('<h') || (div.length > 50 && !div.includes('data-replit-metadata'))
    ).length;
    return Math.max(pTagCount, divWithContentCount);
  };

  // Function to clean HTML content by removing metadata and simplifying structure
  const cleanHtmlContent = (content: string) => {
    // Remove Replit metadata attributes
    let cleaned = content.replace(/data-replit-metadata="[^"]*"/g, '');
    cleaned = cleaned.replace(/data-component-name="[^"]*"/g, '');
    
    // Remove excessive nested divs that only contain other divs
    cleaned = cleaned.replace(/<div[^>]*>\s*<div[^>]*>/g, '<div>');
    cleaned = cleaned.replace(/<\/div>\s*<\/div>/g, '</div>');
    
    // Remove empty divs
    cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');
    
    // Remove empty paragraphs with just &nbsp;
    cleaned = cleaned.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  // Function to render content with proper formatting
  const renderContent = (content: string, isExpanded: boolean) => {
    // Check if content appears to be HTML
    const isHtmlContent = content.includes('<div>') || content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>');
    
    if (isHtmlContent) {
      // Clean the HTML content first
      const cleanedContent = cleanHtmlContent(content);
      
      if (!isExpanded) {
        // Show truncated HTML content
        return (
          <div className="space-y-2">
            <div 
              className="overflow-hidden prose prose-base sm:prose-lg dark:prose-invert max-w-none" 
              style={{ maxHeight: '300px' }}
              dangerouslySetInnerHTML={{ __html: cleanedContent }} 
            />
            <p className="text-base text-muted-foreground">...</p>
          </div>
        );
      } else {
        // Show full HTML content
        return (
          <div className="space-y-2">
            <div 
              className="prose prose-base sm:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: cleanedContent }} 
            />
          </div>
        );
      }
    }
    
    // For Markdown or plain text content, use MarkdownRenderer
    if (!isExpanded) {
      // Split content and show limited paragraphs
      const paragraphs = content.split("\n\n");
      const limitedContent = paragraphs.slice(0, 3).join("\n\n");
      
      return (
        <div className="space-y-2">
          <MarkdownRenderer content={limitedContent} />
          {paragraphs.length > 3 && (
            <p className="text-base text-muted-foreground">...</p>
          )}
        </div>
      );
    }
    
    // Show full Markdown content
    return (
      <div className="space-y-2">
        <MarkdownRenderer content={content} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="bg-background border-0">
          <CardContent className="pt-6 bg-background">
            <Skeleton className="h-8 w-[350px] mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-10 w-[120px] mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data || !data.contents || data.contents.length === 0) {
    return null;
  }
  
  const contents = data.contents;
  const hasMoreContent = data.pagination.hasMore;
  
  const loadMoreContent = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container py-8">
      {contents.map((content) => (
        <Card key={content.id} className="mb-8 bg-background border-0">
          <CardContent className="pt-6 bg-background">
            <h2 className="text-2xl font-bold mb-4 text-foreground">{content.title}</h2>
            {renderContent(content.content, !!expanded[content.id])}
            {/* Always show Read More button for HTML content or content with multiple paragraphs */}
            {(content.content.includes('<div>') || content.content.includes('<p>') || countContentElements(content.content) > 3 || content.content.split("\n\n").length > 3) && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => toggleExpanded(content.id)}
                  className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {expanded[content.id] ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Read More
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {hasMoreContent && (
        <div className="flex justify-center mt-4 mb-8">
          <Button 
            variant="default" 
            className="px-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-md shadow-md"
            onClick={loadMoreContent}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                Loading...
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                Load More Content
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}