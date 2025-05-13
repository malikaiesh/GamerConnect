import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/layout";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SitemapsPage() {
  const [isRefreshing, setIsRefreshing] = useState<{ [key: string]: boolean }>({});

  const { data: sitemaps, isLoading } = useQuery({
    queryKey: ["/api/sitemaps"],
    queryFn: async () => {
      const response = await fetch("/api/sitemaps");
      if (!response.ok) {
        throw new Error("Failed to fetch sitemaps");
      }
      return response.json();
    }
  });

  const updateSitemapMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/sitemaps/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemaps"] });
      toast({
        title: "Sitemap updated",
        description: "The sitemap settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update sitemap",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateSitemapMutation = useMutation({
    mutationFn: async (type: string) => {
      setIsRefreshing(prev => ({ ...prev, [type]: true }));
      const response = await apiRequest("POST", `/api/sitemaps/generate/${type}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemaps"] });
      toast({
        title: "Sitemap generated",
        description: "The sitemap has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate sitemap",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: (_, __, type) => {
      setIsRefreshing(prev => ({ ...prev, [type]: false }));
    }
  });

  const generateAllSitemapsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sitemaps/generate-all", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemaps"] });
      toast({
        title: "All sitemaps generated",
        description: "All sitemaps have been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate all sitemaps",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, isEnabled: boolean) => {
    updateSitemapMutation.mutate({
      id,
      data: { isEnabled },
    });
  };

  const handleGenerateSitemap = (type: string) => {
    generateSitemapMutation.mutate(type);
  };

  const handleGenerateAllSitemaps = () => {
    generateAllSitemapsMutation.mutate();
  };

  const getSitemapTypeLabel = (type: string) => {
    switch (type) {
      case "main":
        return "Main Index";
      case "games":
        return "Games";
      case "blog":
        return "Blog Posts";
      case "pages":
        return "Static Pages";
      default:
        return type;
    }
  };

  // Format URL for display and for direct link
  const formatSitemapUrl = (url: string) => {
    return url.startsWith('/') ? url : `/${url}`;
  };

  // Get the full URL including domain
  const getFullSitemapUrl = (url: string) => {
    const domain = window.location.origin;
    const formattedUrl = formatSitemapUrl(url);
    return `${domain}${formattedUrl}`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sitemaps</h1>
            <p className="text-muted-foreground mt-1">
              Manage and generate XML sitemaps for search engines.
            </p>
          </div>
          <Button 
            onClick={handleGenerateAllSitemaps} 
            variant="default" 
            disabled={generateAllSitemapsMutation.isPending}
          >
            {generateAllSitemapsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate All Sitemaps
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Sitemap Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enable or disable sitemaps and generate them manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">URL</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Last Generated</TableHead>
                    <TableHead className="text-foreground">URL Count</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitemaps?.map((sitemap: any) => (
                    <TableRow key={sitemap.id}>
                      <TableCell className="font-medium text-foreground">
                        {getSitemapTypeLabel(sitemap.type)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <a 
                          href={getFullSitemapUrl(sitemap.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {formatSitemapUrl(sitemap.url)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={sitemap.isEnabled}
                            onCheckedChange={(checked) => handleStatusChange(sitemap.id, checked)}
                            disabled={updateSitemapMutation.isPending}
                          />
                          <Badge variant={sitemap.isEnabled ? "default" : "outline"}>
                            {sitemap.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {sitemap.lastGenerated 
                          ? format(new Date(sitemap.lastGenerated), 'MMM d, yyyy h:mm a')
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-foreground">{sitemap.urlCount || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleGenerateSitemap(sitemap.type)}
                          size="sm"
                          variant="outline"
                          disabled={generateSitemapMutation.isPending || isRefreshing[sitemap.type]}
                        >
                          {isRefreshing[sitemap.type] ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm text-muted-foreground">
            <div>
              <p>XML sitemaps help search engines like Google find and index your content.</p>
              <p>The main sitemap index links to all other sitemaps.</p>
            </div>
            <div className="text-right">
              <p>Last updated: {sitemaps?.length > 0 ? format(new Date(), 'MMM d, yyyy h:mm a') : 'Never'}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}