import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const seoSettingsSchema = z.object({
  siteTitle: z.string().min(3, { message: "Site title must be at least 3 characters" }),
  metaDescription: z.string().min(10, { message: "Meta description must be at least 10 characters" }),
  keywords: z.string(),
  siteLogo: z.string().url().optional().nullable(),
  siteFavicon: z.string().url().optional().nullable(),
  useTextLogo: z.boolean().default(true),
  textLogoColor: z.string().default("#4f46e5"),
  adsTxt: z.string().optional(),
});

type SeoSettingsFormValues = z.infer<typeof seoSettingsSchema>;

export function SeoSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<SeoSettingsFormValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      siteTitle: settings?.siteTitle || "",
      metaDescription: settings?.metaDescription || "",
      keywords: settings?.keywords || "",
      siteLogo: settings?.siteLogo || "",
      siteFavicon: settings?.siteFavicon || "",
      useTextLogo: settings?.useTextLogo ?? true,
      textLogoColor: settings?.textLogoColor || "#4f46e5",
    },
    values: {
      siteTitle: settings?.siteTitle || "",
      metaDescription: settings?.metaDescription || "",
      keywords: settings?.keywords || "",
      siteLogo: settings?.siteLogo || "",
      siteFavicon: settings?.siteFavicon || "",
      useTextLogo: settings?.useTextLogo ?? true,
      textLogoColor: settings?.textLogoColor || "#4f46e5",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: SeoSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/seo", values);
    },
    onSuccess: () => {
      toast({
        title: "SEO settings updated",
        description: "The SEO settings have been updated successfully.",
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

  const onSubmit = (values: SeoSettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="meta" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="meta">Meta Data</TabsTrigger>
                <TabsTrigger value="branding">Logo & Branding</TabsTrigger>
                <TabsTrigger value="ads">Ads.txt</TabsTrigger>
              </TabsList>
              
              {/* Meta Data Tab */}
              <TabsContent value="meta" className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Title</FormLabel>
                      <FormControl>
                        <Input placeholder="GameZone - Play Free Online Games" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title that appears in search results and browser tabs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Discover and play thousands of free online games across all genres. No downloads required - play instantly in your browser!"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short description of your site that appears in search results (150-160 characters recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="online games, free games, browser games, racing games, puzzle games"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords related to your website (less important for modern SEO)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Logo & Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <FormField
                  control={form.control}
                  name="useTextLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Use Text Logo</FormLabel>
                        <FormDescription>
                          Display website name as text instead of an image logo
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('useTextLogo') ? (
                  <FormField
                    control={form.control}
                    name="textLogoColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Logo Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            <div 
                              className="w-10 h-10 rounded border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <Input
                              type="color"
                              {...field}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1"
                              placeholder="#4f46e5"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose the color for your text logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="siteLogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Logo URL</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              placeholder="https://example.com/logo.png"
                              {...field}
                              value={field.value || ""}
                            />
                            {field.value && (
                              <div className="h-12 border rounded flex items-center justify-center p-2 bg-muted/20">
                                <img 
                                  src={field.value} 
                                  alt="Site Logo Preview" 
                                  className="max-h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the URL of your site logo image (recommended size: 180x50px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="siteFavicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon URL</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            placeholder="https://example.com/favicon.ico"
                            {...field}
                            value={field.value || ""}
                          />
                          {field.value && (
                            <div className="h-10 w-10 border rounded flex items-center justify-center p-1 bg-muted/20">
                              <img 
                                src={field.value} 
                                alt="Favicon Preview" 
                                className="max-h-full max-w-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the URL of your site favicon (recommended size: 32x32px, formats: .ico, .png)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Ads.txt Tab */}
              <TabsContent value="ads" className="space-y-4">
                <FormField
                  control={form.control}
                  name="adsTxt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ads.txt Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                          rows={10}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Content for your ads.txt file. This is used by ad networks to combat ad fraud. Paste the content provided by your ad partners.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full md:w-auto mt-6"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save SEO Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
