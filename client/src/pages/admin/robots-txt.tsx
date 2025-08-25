import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Bot, FileText, Info, ExternalLink, Copy, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { SiteSetting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const defaultRobotsTxt = `User-agent: *
Allow: /

# Allow crawling of games
Allow: /games/
Allow: /game/

# Allow crawling of blog content
Allow: /blog/
Allow: /api/sitemap/

# Block admin areas
Disallow: /admin/
Disallow: /api/

# Block sensitive files
Disallow: /*.json$
Disallow: /uploads/private/

# Common SEO optimizations
Crawl-delay: 1

# Sitemap location
Sitemap: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/sitemap.xml
Sitemap: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/sitemap-games.xml
Sitemap: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/sitemap-blog.xml`;

export default function RobotsTxtPage() {
  const { toast } = useToast();
  const [robotsContent, setRobotsContent] = useState(defaultRobotsTxt);
  const [copied, setCopied] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Update robots content when settings are loaded
  useEffect(() => {
    if (settings?.robotsTxt) {
      setRobotsContent(settings.robotsTxt);
    }
  }, [settings]);

  const updateRobotsMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('PATCH', '/api/settings/robots-txt', {
        robotsTxt: content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Robots.txt Updated",
        description: "Your robots.txt file has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating robots.txt:', error);
      toast({
        title: "Error",
        description: "Failed to update robots.txt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateRobotsMutation.mutate(robotsContent);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(robotsContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Robots.txt content copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setRobotsContent(defaultRobotsTxt);
    toast({
      title: "Reset to Default",
      description: "Robots.txt content has been reset to SEO-optimized defaults.",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Robots.txt Management</h1>
            <p className="text-muted-foreground">
              Control how search engines crawl and index your website
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About Robots.txt</AlertTitle>
          <AlertDescription>
            The robots.txt file tells search engine crawlers which pages or sections of your site they should or shouldn't visit. 
            This helps control how your content is indexed and can improve SEO performance.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Edit Robots.txt Content
                </CardTitle>
                <CardDescription>
                  Customize your robots.txt file with SEO-optimized directives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="robots-content">Robots.txt Content</Label>
                  <Textarea
                    id="robots-content"
                    value={robotsContent}
                    onChange={(e) => setRobotsContent(e.target.value)}
                    placeholder="Enter your robots.txt content..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={updateRobotsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateRobotsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy Content'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">File Location:</span>
                    <span className="text-sm font-mono">/robots.txt</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm">{new Blob([robotsContent]).size} bytes</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => window.open('/robots.txt', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SEO Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">✅ Do Allow:</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Public game pages</li>
                      <li>• Blog articles</li>
                      <li>• Category pages</li>
                      <li>• Sitemap files</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">❌ Do Block:</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Admin panels</li>
                      <li>• Private files</li>
                      <li>• API endpoints</li>
                      <li>• User accounts</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">💡 Pro Tips:</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Include sitemap URLs</li>
                      <li>• Set reasonable crawl delays</li>
                      <li>• Test with Google Search Console</li>
                      <li>• Keep it simple and clear</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Directives */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Directives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-xs">User-agent: *</code>
                    <p className="text-muted-foreground mt-1">Applies to all crawlers</p>
                  </div>
                  
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Allow: /path/</code>
                    <p className="text-muted-foreground mt-1">Explicitly allow crawling</p>
                  </div>
                  
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Disallow: /path/</code>
                    <p className="text-muted-foreground mt-1">Block crawling of path</p>
                  </div>
                  
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Crawl-delay: 1</code>
                    <p className="text-muted-foreground mt-1">Wait 1 second between requests</p>
                  </div>
                  
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Sitemap: URL</code>
                    <p className="text-muted-foreground mt-1">Link to your sitemap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}