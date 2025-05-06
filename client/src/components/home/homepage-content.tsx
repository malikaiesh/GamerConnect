import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HomePageContent } from "@shared/schema";
import { ChevronDown, ChevronUp } from "lucide-react";

export function HomepageContent() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  
  const { data: contents, isLoading, error } = useQuery<HomePageContent[]>({
    queryKey: ['/api/homepage-content/active'],
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
          <h2 key={idx} className="text-2xl font-bold mt-6 mb-4">
            {formatText(paragraph.substring(2))}
          </h2>
        );
      }
      
      // Check for subheadings
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xl font-semibold mt-5 mb-3">
            {formatText(paragraph.substring(3))}
          </h3>
        );
      }
      
      // Check for FAQ questions
      if (paragraph.startsWith('Q: ')) {
        return (
          <div key={idx} className="font-medium text-lg mt-4 mb-2">
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

  // Function to render content with proper formatting
  const renderContent = (content: string, isExpanded: boolean) => {
    // Split content into paragraphs
    const paragraphs = content.split("\n\n");
    
    // If not expanded, just show first 2-3 paragraphs (approximately 500 characters)
    if (!isExpanded) {
      // Get first 2-3 paragraphs or approximately 500 characters
      let displayParagraphs: string[] = [];
      let contentLength = 0;
      
      for (const paragraph of paragraphs) {
        if (contentLength > 500 || displayParagraphs.length >= 3) break;
        displayParagraphs.push(paragraph);
        contentLength += paragraph.length;
      }
      
      return (
        <div className="space-y-2">
          {processParagraphs(displayParagraphs)}
          {paragraphs.length > displayParagraphs.length && (
            <p className="text-base text-muted-foreground">...</p>
          )}
        </div>
      );
    }
    
    // If expanded, show all content with proper formatting
    return (
      <div className="space-y-2">
        {processParagraphs(paragraphs)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
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

  if (error || !contents || contents.length === 0) {
    return null;
  }

  return (
    <div className="container py-8">
      {contents.map((content) => (
        <Card key={content.id} className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
            {renderContent(content.content, !!expanded[content.id])}
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleExpanded(content.id)}
                className="flex items-center gap-1"
              >
                {expanded[content.id] ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load More
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}