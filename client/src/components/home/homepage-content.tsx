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

  // Function to render content with proper formatting
  const renderContent = (content: string, isExpanded: boolean) => {
    // If not expanded, just show first 2-3 paragraphs (approximately 500 characters)
    if (!isExpanded) {
      const paragraphs = content.split("\n\n");
      // Get first 2-3 paragraphs or approximately 500 characters
      let displayContent = "";
      let paragraphCount = 0;
      
      for (const paragraph of paragraphs) {
        if (displayContent.length > 500 || paragraphCount >= 3) break;
        displayContent += paragraph + "\n\n";
        paragraphCount++;
      }
      
      return (
        <div className="space-y-4">
          {displayContent.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {content.length > displayContent.length && (
            <p className="text-base text-muted-foreground">...</p>
          )}
        </div>
      );
    }
    
    // If expanded, show all content with proper paragraph breaks
    return (
      <div className="space-y-4">
        {content.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-base leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
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