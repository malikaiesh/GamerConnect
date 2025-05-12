import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Loader2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdsTxtPage() {
  const { toast } = useToast();
  const [adsTxtContent, setAdsTxtContent] = useState<string>("");

  // Fetch current site settings
  const { data: settings, isLoading, error } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/settings');
      const data = await res.json();
      setAdsTxtContent(data.adsTxt || "");
      return data;
    }
  });

  // Update ads.txt content
  const updateAdsTxtMutation = useMutation({
    mutationFn: async (adsTxt: string) => {
      const res = await apiRequest('PATCH', '/api/settings', { adsTxt });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Ads.txt content updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ads.txt content.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateAdsTxtMutation.mutate(adsTxtContent);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Ads.txt Management | Admin</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Ads.txt Management</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ads.txt Content</CardTitle>
              <CardDescription>
                Manage the content of your ads.txt file. This file is used by ad networks to identify authorized digital sellers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Your ads.txt file will be accessible at <code className="bg-muted px-1 py-0.5 rounded">/ads.txt</code> on your website.
                  Each line should contain information about authorized digital sellers in the format specified by the IAB Tech Lab.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your ads.txt content here..."
                  className="min-h-[300px] font-mono"
                  value={adsTxtContent}
                  onChange={(e) => setAdsTxtContent(e.target.value)}
                  disabled={isLoading || updateAdsTxtMutation.isPending}
                />
                
                <div className="text-xs text-muted-foreground">
                  <p>Example format:</p>
                  <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
                    google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0<br/>
                    adnetwork.com, 0000000, RESELLER, a1b2c3d4e5f6g7h8<br/>
                    adexchange.com, 123456, DIRECT
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isLoading || updateAdsTxtMutation.isPending}
              >
                {updateAdsTxtMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}