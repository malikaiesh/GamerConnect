import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart } from "lucide-react";
import AdminNavigation from "@/components/admin/navigation";

const blogAdsSettingsSchema = z.object({
  headerAds: z.string().optional(),
  footerAds: z.string().optional(),
  sidebarAds: z.string().optional(),
  contentAds: z.string().optional(),
  floatingHeaderAds: z.string().optional(),
  floatingFooterAds: z.string().optional(),
  
  // New paragraph ad positions
  paragraph2Ad: z.string().optional(),
  paragraph4Ad: z.string().optional(),
  paragraph6Ad: z.string().optional(), 
  paragraph8Ad: z.string().optional(),
  afterContentAd: z.string().optional(),
  
  // Google ad controls
  enableGoogleAds: z.boolean().default(false),
  googleAdClient: z.string().optional(),
});

type BlogAdsSettingsFormValues = z.infer<typeof blogAdsSettingsSchema>;

export default function BlogAdsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<BlogAdsSettingsFormValues>({
    resolver: zodResolver(blogAdsSettingsSchema),
    defaultValues: {
      headerAds: settings?.headerAds || "",
      footerAds: settings?.footerAds || "",
      sidebarAds: settings?.sidebarAds || "",
      contentAds: settings?.contentAds || "",
      floatingHeaderAds: settings?.floatingHeaderAds || "",
      floatingFooterAds: settings?.floatingFooterAds || "",
      
      // Paragraph ad positions
      paragraph2Ad: settings?.paragraph2Ad || "",
      paragraph4Ad: settings?.paragraph4Ad || "",
      paragraph6Ad: settings?.paragraph6Ad || "",
      paragraph8Ad: settings?.paragraph8Ad || "",
      afterContentAd: settings?.afterContentAd || "",
      
      // Google ad settings
      enableGoogleAds: settings?.enableGoogleAds || false,
      googleAdClient: settings?.googleAdClient || "",
    },
    values: {
      headerAds: settings?.headerAds || "",
      footerAds: settings?.footerAds || "",
      sidebarAds: settings?.sidebarAds || "",
      contentAds: settings?.contentAds || "",
      floatingHeaderAds: settings?.floatingHeaderAds || "",
      floatingFooterAds: settings?.floatingFooterAds || "",
      
      // Paragraph ad positions
      paragraph2Ad: settings?.paragraph2Ad || "",
      paragraph4Ad: settings?.paragraph4Ad || "",
      paragraph6Ad: settings?.paragraph6Ad || "",
      paragraph8Ad: settings?.paragraph8Ad || "",
      afterContentAd: settings?.afterContentAd || "",
      
      // Google ad settings
      enableGoogleAds: settings?.enableGoogleAds || false,
      googleAdClient: settings?.googleAdClient || "",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: BlogAdsSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/ads", values);
    },
    onSuccess: () => {
      toast({
        title: "Ad settings updated",
        description: "The blog ad settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: BlogAdsSettingsFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Blog Ads</h1>
          <p className="text-muted-foreground">Configure advertisements displayed on your blog pages</p>
        </div>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Blog Advertisement Settings
            </CardTitle>
            <CardDescription>
              Configure ads that appear within blog posts and article pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Google Ads Integration */}
                  <div className="bg-card/50 rounded-lg p-4 border border-border">
                    <h3 className="text-lg font-medium mb-2 text-foreground">Google AdSense Integration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure Google AdSense for automated ad placement in your blog posts
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="enableGoogleAds"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-border">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Enable Google AdSense</FormLabel>
                              <FormDescription>
                                Automatically place Google ads in optimal positions
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="googleAdClient"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google AdSense Client ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="ca-pub-xxxxxxxxxxxxxxxx" 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Your Google AdSense publisher ID (starts with ca-pub-)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Paragraph Position Ads */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-foreground">Paragraph Position Ads</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Insert ads after specific paragraphs in blog post content
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="paragraph2Ad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>After 2nd Paragraph Ad</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Ad will appear after the second paragraph
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paragraph4Ad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>After 4th Paragraph Ad</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Ad will appear after the fourth paragraph
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="paragraph6Ad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>After 6th Paragraph Ad</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Ad will appear after the sixth paragraph
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paragraph8Ad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>After 8th Paragraph Ad</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Ad will appear after the eighth paragraph
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="afterContentAd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>After Content Ad</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Ad will appear at the end of the blog post content but before comments
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Standard Blog Ad Positions */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-foreground">Standard Blog Ad Positions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="headerAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Appears at the top of blog pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Appears at the bottom of blog pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="sidebarAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sidebar Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Appears in the sidebar of blog pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contentAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>In-Content Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Appears within blog post content (general position)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Floating Ads */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-foreground">Floating Ads</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="floatingHeaderAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floating Header Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Floating ads at the top of blog pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="floatingFooterAds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floating Footer Ads</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your ad code here"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Floating ads at the bottom of blog pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Blog Ad Settings
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}