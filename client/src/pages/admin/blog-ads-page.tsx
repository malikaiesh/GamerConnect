import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";

const blogAdsSettingsSchema = z.object({
  headerAds: z.string().optional(),
  footerAds: z.string().optional(),
  sidebarAds: z.string().optional(),
  contentAds: z.string().optional(),
  floatingHeaderAds: z.string().optional(),
  floatingFooterAds: z.string().optional(),
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
    },
    values: {
      headerAds: settings?.headerAds || "",
      footerAds: settings?.footerAds || "",
      sidebarAds: settings?.sidebarAds || "",
      contentAds: settings?.contentAds || "",
      floatingHeaderAds: settings?.floatingHeaderAds || "",
      floatingFooterAds: settings?.floatingFooterAds || "",
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
    <AdminLayout title="Blog Ads">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Blog Advertisement Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            This code will be displayed at the top of every page
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
                            This code will be displayed at the bottom of every page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            This code will be displayed in sidebars where available
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
                            This code will be displayed within content (e.g., between blog posts)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            This code will create floating ads at the top of the page
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
                            This code will create floating ads at the bottom of the page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
    </AdminLayout>
  );
}