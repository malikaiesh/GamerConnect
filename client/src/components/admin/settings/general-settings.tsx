import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { themes } from "@/lib/themes";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const generalSettingsSchema = z.object({
  currentTheme: z.string().min(1, { message: "Please select a theme" }),
  pushNotificationsEnabled: z.boolean(),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export function GeneralSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Initialize form with current settings
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      currentTheme: settings?.currentTheme || "modern",
      pushNotificationsEnabled: settings?.pushNotificationsEnabled ?? true,
    },
    values: {
      currentTheme: settings?.currentTheme || "modern",
      pushNotificationsEnabled: settings?.pushNotificationsEnabled ?? true,
    },
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (values: GeneralSettingsFormValues) => {
      return apiRequest("PATCH", "/api/settings/general", values);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "The general settings have been updated successfully.",
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

  const onSubmit = (values: GeneralSettingsFormValues) => {
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
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="themes" className="w-full">
              <TabsList>
                <TabsTrigger value="themes">Themes</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="themes" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="currentTheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set the default theme for new visitors. Users can still change their theme preference.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        form.watch("currentTheme") === theme.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => form.setValue("currentTheme", theme.id)}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">{theme.name}</h3>
                        {form.watch("currentTheme") === theme.id && (
                          <div className="h-4 w-4 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="pushNotificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Push Notifications</FormLabel>
                        <FormDescription>
                          Enable or disable push notifications site-wide
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-700"
                          onClick={() => form.setValue("pushNotificationsEnabled", !field.value)}>
                          <span aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              field.value ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </FormControl>
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
              Save General Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
