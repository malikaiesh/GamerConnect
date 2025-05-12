import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InternalLinksResponse {
  message: string;
  results: {
    updated: number;
    skipped: number;
    total: number;
    errors: number;
  };
}

export function BlogInternalLinks() {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const updateInternalLinksMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/blog/update-internal-links');
        
        // Check if response is OK
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Server error: ${response.status} ${response.statusText}`
          );
        }
        
        // Safely parse the JSON response
        const data = await response.json();
        return data as InternalLinksResponse;
      } catch (err) {
        console.error("Error in internal links mutation:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      setLastUpdate(new Date());
      toast({
        title: 'Internal links updated successfully',
        description: `${data.results.updated} posts updated, ${data.results.skipped} posts skipped.`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: 'Failed to update internal links',
        description: error.message || 'An error occurred while updating internal links.',
        variant: 'destructive',
      });
    }
  });
  
  const handleUpdateInternalLinks = () => {
    updateInternalLinksMutation.mutate();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Blog Internal Links</CardTitle>
        <CardDescription>
          Automatically add internal links to blog posts for improved SEO and user experience.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">What are internal links?</h3>
            <p className="text-sm text-muted-foreground">
              Internal links connect your blog posts to other relevant content on your site. 
              They help search engines understand your content structure and keep users engaged 
              by providing paths to related articles.
            </p>
            
            <h3 className="text-sm font-medium mt-2">How it works</h3>
            <p className="text-sm text-muted-foreground">
              Our system analyzes your published blog posts, identifies relevant keywords, 
              and automatically creates links between related articles. This process helps improve:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>SEO rankings</li>
              <li>User engagement</li>
              <li>Time spent on site</li>
              <li>Content discovery</li>
            </ul>
          </div>
        </div>
        
        {updateInternalLinksMutation.data && (
          <Alert className={updateInternalLinksMutation.data.results.errors > 0 ? 'border-orange-500' : 'border-green-500'}>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Process completed</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>Total posts processed:</div>
                  <div className="font-medium">{updateInternalLinksMutation.data.results.total}</div>
                  <div>Posts updated:</div>
                  <div className="font-medium">{updateInternalLinksMutation.data.results.updated}</div>
                  <div>Posts skipped:</div>
                  <div className="font-medium">{updateInternalLinksMutation.data.results.skipped}</div>
                  {updateInternalLinksMutation.data.results.errors > 0 && (
                    <>
                      <div className="text-orange-600">Errors:</div>
                      <div className="font-medium text-orange-600">{updateInternalLinksMutation.data.results.errors}</div>
                    </>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {lastUpdate && (
            <span>Last updated: {lastUpdate.toLocaleString()}</span>
          )}
        </div>
        <Button 
          onClick={handleUpdateInternalLinks} 
          disabled={updateInternalLinksMutation.isPending}
        >
          {updateInternalLinksMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Internal Links
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}