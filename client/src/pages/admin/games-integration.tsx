import { useState, useEffect } from "react";
import AdminNavigation from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Gamepad2, Settings, Eye, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SiteSetting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const gamesIntegrationSchema = z.object({
  blogGamesEnabled: z.boolean().default(true),
  gamesPerPosition: z.number().min(1).max(10).default(1),
  showGameCategories: z.boolean().default(false),
  showGameRatings: z.boolean().default(true),
  showPlayCounts: z.boolean().default(true),
  autoRotateGames: z.boolean().default(true),
  // Individual paragraph position controls
  paragraph2GamesEnabled: z.boolean().default(true),
  paragraph6GamesEnabled: z.boolean().default(true), 
  paragraph8GamesEnabled: z.boolean().default(true),
  paragraph10GamesEnabled: z.boolean().default(true),
});

type GamesIntegrationValues = z.infer<typeof gamesIntegrationSchema>;

export default function GamesIntegrationPage() {
  const { toast } = useToast();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  const form = useForm<GamesIntegrationValues>({
    resolver: zodResolver(gamesIntegrationSchema),
    defaultValues: {
      blogGamesEnabled: true,
      gamesPerPosition: 1,
      showGameCategories: false,
      showGameRatings: true,
      showPlayCounts: true,
      autoRotateGames: true,
      paragraph2GamesEnabled: true,
      paragraph6GamesEnabled: true,
      paragraph8GamesEnabled: true,
      paragraph10GamesEnabled: true,
    }
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        blogGamesEnabled: settings.blogGamesEnabled ?? true,
        gamesPerPosition: 1,
        showGameCategories: false,
        showGameRatings: true,
        showPlayCounts: true,
        autoRotateGames: true,
        paragraph2GamesEnabled: (settings as any).paragraph2GamesEnabled ?? true,
        paragraph6GamesEnabled: (settings as any).paragraph6GamesEnabled ?? true,
        paragraph8GamesEnabled: (settings as any).paragraph8GamesEnabled ?? true,
        paragraph10GamesEnabled: (settings as any).paragraph10GamesEnabled ?? true,
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: GamesIntegrationValues) => {
      try {
        // Try to fetch current settings first
        const currentSettings = await apiRequest('/api/settings');
        
        // Merge with new games integration settings
        const updatedSettings = {
          ...currentSettings,
          blogGamesEnabled: data.blogGamesEnabled,
          paragraph2GamesEnabled: data.paragraph2GamesEnabled,
          paragraph6GamesEnabled: data.paragraph6GamesEnabled,
          paragraph8GamesEnabled: data.paragraph8GamesEnabled,
          paragraph10GamesEnabled: data.paragraph10GamesEnabled,
        };
        
        return apiRequest('/api/settings', {
          method: 'PUT',
          body: updatedSettings
        });
      } catch (error: any) {
        // If settings don't exist (404), create them with defaults
        if (error.message?.includes('Site settings not found')) {
          const defaultSettings = {
            siteTitle: 'Gaming Portal',
            metaDescription: 'A comprehensive gaming portal with the latest games, reviews, and community features.',
            keywords: 'games, gaming, portal, reviews, community',
            currentTheme: 'modern',
            useTextLogo: true,
            textLogoColor: '#4f46e5',
            pushNotificationsEnabled: true,
            cookiePopupEnabled: true,
            cookiePopupTitle: 'We use cookies',
            cookiePopupMessage: 'We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.',
            cookieAcceptButtonText: 'Accept All',
            cookieDeclineButtonText: 'Decline',
            cookieLearnMoreText: 'Learn More',
            cookieLearnMoreUrl: '/privacy',
            cookiePopupPosition: 'bottom',
            cookiePopupTheme: 'dark',
            blogGamesEnabled: data.blogGamesEnabled,
            paragraph2GamesEnabled: data.paragraph2GamesEnabled,
            paragraph6GamesEnabled: data.paragraph6GamesEnabled,
            paragraph8GamesEnabled: data.paragraph8GamesEnabled,
            paragraph10GamesEnabled: data.paragraph10GamesEnabled,
          };
          
          return apiRequest('/api/settings', {
            method: 'PUT',
            body: defaultSettings
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Games integration settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: GamesIntegrationValues) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Games Integration</h1>
            <p className="text-muted-foreground">
              Configure how games are displayed within blog articles and content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Main Configuration */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5" />
                  Integration Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure how games appear in your blog articles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="blogGamesEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border border-border bg-background rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-foreground">Enable Blog Games Integration</FormLabel>
                        <FormDescription className="text-muted-foreground">
                          Show featured games within blog articles at specific paragraph positions
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="showGameRatings"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border bg-background rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Show Game Ratings</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Display star ratings for games
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

                  <FormField
                    control={form.control}
                    name="showPlayCounts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border bg-background rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Show Play Counts</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Display how many times games have been played
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
                </div>
              </CardContent>
            </Card>

            {/* Display Options */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Eye className="w-5 h-5" />
                  Display Options
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize how games appear to your readers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="showGameCategories"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border bg-background rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Show Game Categories</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Display category badges on game cards
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

                  <FormField
                    control={form.control}
                    name="autoRotateGames"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border bg-background rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Auto-Rotate Games</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Show different games at each position
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
                </div>
              </CardContent>
            </Card>

            {/* Individual Paragraph Controls */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5" />
                  Paragraph Position Controls
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enable or disable games at specific paragraph positions in blog articles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paragraph2GamesEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border rounded-md bg-gradient-to-r from-primary/10 to-primary/5">
                        <div className="space-y-0.5">
                          <FormLabel className="text-primary font-semibold">Paragraph 2 Games</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Show games after the 2nd paragraph in each section
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

                  <FormField
                    control={form.control}
                    name="paragraph6GamesEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border rounded-md bg-gradient-to-r from-primary/8 to-primary/4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-primary font-semibold">Paragraph 6 Games</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Show games after the 6th paragraph in articles
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

                  <FormField
                    control={form.control}
                    name="paragraph8GamesEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border rounded-md bg-gradient-to-r from-primary/6 to-primary/3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-primary font-semibold">Paragraph 8 Games</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Show games after the 8th paragraph in articles
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

                  <FormField
                    control={form.control}
                    name="paragraph10GamesEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border border-border rounded-md bg-gradient-to-r from-primary/4 to-primary/2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-primary font-semibold">Paragraph 10 Games</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Show games after the 10th paragraph in articles
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
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong className="text-foreground">Pro Tip:</strong> Games rotate automatically to provide variety across different blog articles.
                    Each enabled position shows a different featured game to keep content fresh and engaging for your readers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit"
                className="flex items-center gap-2"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}