import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import AdminNavigation from "@/components/admin/navigation";

const cookieSettingsSchema = z.object({
  cookiePopupEnabled: z.boolean(),
  cookiePopupTitle: z.string().min(1, { message: "Title is required" }),
  cookiePopupMessage: z.string().min(1, { message: "Message is required" }),
  cookieAcceptButtonText: z.string().min(1, { message: "Accept button text is required" }),
  cookieDeclineButtonText: z.string().min(1, { message: "Decline button text is required" }),
  cookieLearnMoreText: z.string().min(1, { message: "Learn more text is required" }),
  cookieLearnMoreUrl: z.string().min(1, { message: "Learn more URL is required" }),
  cookiePopupPosition: z.enum(['bottom', 'top', 'center']),
  cookiePopupTheme: z.enum(['dark', 'light']),
});

type CookieSettingsFormValues = z.infer<typeof cookieSettingsSchema>;

export default function CookieSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<CookieSettingsFormValues>({
    resolver: zodResolver(cookieSettingsSchema),
    defaultValues: {
      cookiePopupEnabled: settings?.cookiePopupEnabled ?? true,
      cookiePopupTitle: settings?.cookiePopupTitle || "We use cookies",
      cookiePopupMessage: settings?.cookiePopupMessage || "We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.",
      cookieAcceptButtonText: settings?.cookieAcceptButtonText || "Accept All",
      cookieDeclineButtonText: settings?.cookieDeclineButtonText || "Decline",
      cookieLearnMoreText: settings?.cookieLearnMoreText || "Learn More",
      cookieLearnMoreUrl: settings?.cookieLearnMoreUrl || "/privacy",
      cookiePopupPosition: (settings?.cookiePopupPosition as "bottom" | "top" | "center") || "bottom",
      cookiePopupTheme: (settings?.cookiePopupTheme as "dark" | "light") || "dark",
    },
    values: {
      cookiePopupEnabled: settings?.cookiePopupEnabled ?? true,
      cookiePopupTitle: settings?.cookiePopupTitle || "We use cookies",
      cookiePopupMessage: settings?.cookiePopupMessage || "We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.",
      cookieAcceptButtonText: settings?.cookieAcceptButtonText || "Accept All",
      cookieDeclineButtonText: settings?.cookieDeclineButtonText || "Decline",
      cookieLearnMoreText: settings?.cookieLearnMoreText || "Learn More",
      cookieLearnMoreUrl: settings?.cookieLearnMoreUrl || "/privacy",
      cookiePopupPosition: (settings?.cookiePopupPosition as "bottom" | "top" | "center") || "bottom",
      cookiePopupTheme: (settings?.cookiePopupTheme as "dark" | "light") || "dark",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: CookieSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/general", values);
    },
    onSuccess: () => {
      toast({
        title: "Cookie settings updated",
        description: "The cookie settings have been updated successfully.",
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

  const onSubmit = (values: CookieSettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Cookie Settings</h1>
          <p className="text-muted-foreground">Configure cookie consent popup settings</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Cookie Consent Configuration</CardTitle>
            <CardDescription>
              Customize the cookie consent popup that appears to your website visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cookiePopupEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Cookie Popup</FormLabel>
                        <FormDescription>
                          Show cookie consent popup to visitors
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-cookie-popup"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cookiePopupTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="We use cookies" 
                            {...field} 
                            data-testid="input-cookie-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookiePopupPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cookie-position">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cookiePopupMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Popup Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="We use cookies to improve your experience on our website..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-cookie-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cookieAcceptButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accept Button Text</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Accept All" 
                            {...field} 
                            data-testid="input-accept-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookieDeclineButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decline Button Text</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Decline" 
                            {...field} 
                            data-testid="input-decline-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookiePopupTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cookie-theme">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cookieLearnMoreText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learn More Text</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Learn More" 
                            {...field} 
                            data-testid="input-learn-more-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookieLearnMoreUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learn More URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="/privacy" 
                            {...field} 
                            data-testid="input-learn-more-url"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your privacy policy or cookie policy page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full md:w-auto"
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Cookie Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}