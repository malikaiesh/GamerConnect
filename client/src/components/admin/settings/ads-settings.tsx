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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const adsSettingsSchema = z.object({
  headerAds: z.string().optional(),
  footerAds: z.string().optional(),
  sidebarAds: z.string().optional(),
  contentAds: z.string().optional(),
  floatingHeaderAds: z.string().optional(),
  floatingFooterAds: z.string().optional(),
  customHeaderCode: z.string().optional(),
  customBodyCode: z.string().optional(),
  customFooterCode: z.string().optional(),
});

type AdsSettingsFormValues = z.infer<typeof adsSettingsSchema>;

export function AdsSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<AdsSettingsFormValues>({
    resolver: zodResolver(adsSettingsSchema),
    defaultValues: {
      headerAds: settings?.headerAds || "",
      footerAds: settings?.footerAds || "",
      sidebarAds: settings?.sidebarAds || "",
      contentAds: settings?.contentAds || "",
      floatingHeaderAds: settings?.floatingHeaderAds || "",
      floatingFooterAds: settings?.floatingFooterAds || "",
      customHeaderCode: settings?.customHeaderCode || "",
      customBodyCode: settings?.customBodyCode || "",
      customFooterCode: settings?.customFooterCode || "",
    },
    values: {
      headerAds: settings?.headerAds || "",
      footerAds: settings?.footerAds || "",
      sidebarAds: settings?.sidebarAds || "",
      contentAds: settings?.contentAds || "",
      floatingHeaderAds: settings?.floatingHeaderAds || "",
      floatingFooterAds: settings?.floatingFooterAds || "",
      customHeaderCode: settings?.customHeaderCode || "",
      customBodyCode: settings?.customBodyCode || "",
      customFooterCode: settings?.customFooterCode || "",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: AdsSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/ads", values);
    },
    onSuccess: () => {
      toast({
        title: "Ad settings updated",
        description: "The ad and custom code settings have been updated successfully.",
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

  const onSubmit = (values: AdsSettingsFormValues) => {
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
        <CardTitle>Ads & Custom Code Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="ads" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ads">Ad Placements</TabsTrigger>
                <TabsTrigger value="custom">Custom Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ads" className="space-y-4 pt-4">
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
                          This code will be displayed within content (e.g., between game listings)
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
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="customHeaderCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Header Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your custom code here"
                          rows={5}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        This code will be added to the <code>&lt;head&gt;</code> section of all pages. Useful for analytics, fonts, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customBodyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Body Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your custom code here"
                          rows={5}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        This code will be added immediately after the opening <code>&lt;body&gt;</code> tag. Useful for widgets, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customFooterCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Footer Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your custom code here"
                          rows={5}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        This code will be added just before the closing <code>&lt;/body&gt;</code> tag. Useful for third-party scripts.
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
              className="w-full md:w-auto"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Ad & Custom Code Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
