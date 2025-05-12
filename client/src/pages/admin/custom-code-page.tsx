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
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileCode } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";

const customCodeSettingsSchema = z.object({
  customHeaderCode: z.string().optional(),
  customBodyCode: z.string().optional(),
  customFooterCode: z.string().optional(),
});

type CustomCodeSettingsFormValues = z.infer<typeof customCodeSettingsSchema>;

export default function CustomCodePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<CustomCodeSettingsFormValues>({
    resolver: zodResolver(customCodeSettingsSchema),
    defaultValues: {
      customHeaderCode: settings?.customHeaderCode || "",
      customBodyCode: settings?.customBodyCode || "",
      customFooterCode: settings?.customFooterCode || "",
    },
    values: {
      customHeaderCode: settings?.customHeaderCode || "",
      customBodyCode: settings?.customBodyCode || "",
      customFooterCode: settings?.customFooterCode || "",
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: CustomCodeSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/custom-code", values);
    },
    onSuccess: () => {
      toast({
        title: "Custom code updated",
        description: "The custom code settings have been updated successfully.",
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

  const onSubmit = (values: CustomCodeSettingsFormValues) => {
    mutation.mutate(values);
  };

  return (
    <AdminLayout title="Custom Code">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" /> 
              Custom Code Insertion
            </CardTitle>
            <CardDescription>
              Add custom HTML, CSS, or JavaScript code to your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customHeaderCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your custom code here"
                            rows={6}
                            {...field}
                            value={field.value || ""}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          This code will be added to the <code>&lt;head&gt;</code> section of all pages. Useful for analytics, fonts, SEO tags, etc.
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
                        <FormLabel>Body Start Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your custom code here"
                            rows={6}
                            {...field}
                            value={field.value || ""}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          This code will be added immediately after the opening <code>&lt;body&gt;</code> tag. Useful for widgets, scripts that need to load early, etc.
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
                        <FormLabel>Footer Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your custom code here"
                            rows={6}
                            {...field}
                            value={field.value || ""}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          This code will be added just before the closing <code>&lt;/body&gt;</code> tag. Useful for third-party scripts, chat widgets, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Custom Code
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