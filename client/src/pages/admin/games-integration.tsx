import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
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
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: GamesIntegrationValues) => {
      return apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          blogGamesEnabled: data.blogGamesEnabled,
        }),
      });
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
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Games Integration</h1>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Integration Settings
                </CardTitle>
                <CardDescription>
                  Configure how games appear in your blog articles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="blogGamesEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Blog Games Integration</FormLabel>
                        <FormDescription>
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
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Show Game Ratings</FormLabel>
                          <FormDescription>
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
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Show Play Counts</FormLabel>
                          <FormDescription>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Display Options
                </CardTitle>
                <CardDescription>
                  Customize how games appear to your readers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="showGameCategories"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Show Game Categories</FormLabel>
                          <FormDescription>
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
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Auto-Rotate Games</FormLabel>
                          <FormDescription>
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

            {/* Game Positions Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Game Positions
                </CardTitle>
                <CardDescription>
                  Games are automatically inserted at these paragraph positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Paragraph 2', 'Paragraph 4', 'Paragraph 6', 'Paragraph 8', 'Paragraph 10'].map((position, index) => (
                    <div key={position} className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">{position}</div>
                      <div className="text-sm text-muted-foreground">Game #{index + 1}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Games rotate automatically to provide variety across different blog articles.
                  Each position shows a different featured game to keep content fresh.
                </p>
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
    </AdminLayout>
  );
}