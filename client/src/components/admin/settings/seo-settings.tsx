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
import { Loader2 } from "lucide-react";

const seoSettingsSchema = z.object({
  siteTitle: z.string().min(3, { message: "Site title must be at least 3 characters" }),
  metaDescription: z.string().min(10, { message: "Meta description must be at least 10 characters" }),
  keywords: z.string(),
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
      adsTxt: settings?.adsTxt || "",
    },
    values: {
      siteTitle: settings?.siteTitle || "",
      metaDescription: settings?.metaDescription || "",
      keywords: settings?.keywords || "",
      adsTxt: settings?.adsTxt || "",
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
            <div className="space-y-4">
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

              <FormField
                control={form.control}
                name="adsTxt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ads.txt Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                        rows={5}
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
            </div>

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full md:w-auto"
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
