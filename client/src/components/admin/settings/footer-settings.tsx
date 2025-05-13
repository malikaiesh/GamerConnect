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
import { Loader2, Facebook, Twitter, Instagram, Youtube, MessageCircle, MessagesSquare, Music } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const footerSettingsSchema = z.object({
  footerCopyright: z.string().optional(),
  footerAppStoreLink: z.string().url("App Store URL must be a valid URL").optional().nullable(),
  footerGooglePlayLink: z.string().url("Google Play URL must be a valid URL").optional().nullable(),
  footerAmazonLink: z.string().url("Amazon URL must be a valid URL").optional().nullable(),
  socialFacebook: z.string().url("Facebook URL must be a valid URL").optional().nullable(),
  socialTwitter: z.string().url("Twitter URL must be a valid URL").optional().nullable(),
  socialInstagram: z.string().url("Instagram URL must be a valid URL").optional().nullable(),
  socialYoutube: z.string().url("YouTube URL must be a valid URL").optional().nullable(),
  socialDiscord: z.string().url("Discord URL must be a valid URL").optional().nullable(),
  socialWhatsapp: z.string().url("WhatsApp URL must be a valid URL").optional().nullable(),
  socialTiktok: z.string().url("TikTok URL must be a valid URL").optional().nullable(),
});

type FooterSettingsFormValues = z.infer<typeof footerSettingsSchema>;

export function FooterSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<FooterSettingsFormValues>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues: {
      footerCopyright: settings?.footerCopyright || "",
      footerAppStoreLink: settings?.footerAppStoreLink || "",
      footerGooglePlayLink: settings?.footerGooglePlayLink || "",
      footerAmazonLink: settings?.footerAmazonLink || "",
      socialFacebook: settings?.socialFacebook || "",
      socialTwitter: settings?.socialTwitter || "",
      socialInstagram: settings?.socialInstagram || "",
      socialYoutube: settings?.socialYoutube || "",
      socialDiscord: settings?.socialDiscord || "",
      socialWhatsapp: settings?.socialWhatsapp || "",
      socialTiktok: settings?.socialTiktok || "",
    },
    values: {
      footerCopyright: settings?.footerCopyright || "",
      footerAppStoreLink: settings?.footerAppStoreLink || "",
      footerGooglePlayLink: settings?.footerGooglePlayLink || "",
      footerAmazonLink: settings?.footerAmazonLink || "",
      socialFacebook: settings?.socialFacebook || "",
      socialTwitter: settings?.socialTwitter || "",
      socialInstagram: settings?.socialInstagram || "",
      socialYoutube: settings?.socialYoutube || "",
      socialDiscord: settings?.socialDiscord || "",
      socialWhatsapp: settings?.socialWhatsapp || "",
      socialTiktok: settings?.socialTiktok || "",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: FooterSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/footer", values);
    },
    onSuccess: () => {
      toast({
        title: "Footer settings updated",
        description: "The footer settings have been updated successfully.",
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

  const onSubmit = (values: FooterSettingsFormValues) => {
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
        <CardTitle>Footer & Social Links</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="footer" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="footer">Footer Links</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
              
              {/* Footer Links Tab */}
              <TabsContent value="footer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="footerCopyright"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Copyright Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="© 2025 Your Company. All rights reserved."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Custom copyright text to display in the footer. Leave empty to use the default text.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerAppStoreLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Store Link</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12.5v6l5-3z"/>
                            </svg>
                          </span>
                          <Input
                            placeholder="https://apps.apple.com/app/..."
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your app on the Apple App Store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerGooglePlayLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Play Link</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 3v18l8-3.5L20 21V3H4zm6.5 11C9.67 14 9 13.33 9 12.5S9.67 11 10.5 11 12 11.67 12 12.5 11.33 14 10.5 14zm3 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                            </svg>
                          </span>
                          <Input
                            placeholder="https://play.google.com/store/apps/..."
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your app on the Google Play Store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerAmazonLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amazon Appstore Link</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.42 13.72c-.41-.32-.8-.56-1.63-.88-1.4-.56-2.78-.82-4.17-.93a.26.26 0 0 1-.21-.19c-.05-.14 0-.34.16-.46a6.45 6.45 0 0 0 2.32-4.58c0-3.33-2.75-5.7-6-5.7h-.21c-3.25 0-6 2.37-6 5.7 0 2 .92 3.62 2.32 4.58.16.12.24.32.16.46a.26.26 0 0 1-.21.19c-1.39.11-2.77.37-4.17.93-.83.32-1.22.56-1.63.88-.21.16-.21.39 0 .55s.61.39 1.06.55a24.45 24.45 0 0 0 8.27 1.4h.48a24.45 24.45 0 0 0 8.27-1.4c.45-.16.85-.39 1.06-.55s.24-.37.07-.53h-.04z"/>
                            </svg>
                          </span>
                          <Input
                            placeholder="https://www.amazon.com/gp/product/..."
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your app on the Amazon Appstore
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4">
                <FormField
                  control={form.control}
                  name="socialFacebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Facebook className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://facebook.com/yourpage"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your Facebook page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialTwitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Twitter className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://twitter.com/youraccount"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your Twitter/X account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialInstagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Instagram className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://instagram.com/youraccount"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your Instagram profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialYoutube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Youtube className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://youtube.com/c/yourchannel"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your YouTube channel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialDiscord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <MessageCircle className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://discord.gg/yourinvite"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your Discord server
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <MessagesSquare className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://wa.me/yourphonenumber"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your WhatsApp contact or group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialTiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Music className="h-5 w-5" />
                          </span>
                          <Input
                            placeholder="https://tiktok.com/@youraccount"
                            className="rounded-l-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to your TikTok profile
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
              Save Footer Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}