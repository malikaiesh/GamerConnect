import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SiteSetting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const generalSettingsSchema = z.object({
  siteTitle: z.string().min(2, "Site title must be at least 2 characters"),
  metaDescription: z.string().max(160, "Meta description should be at most 160 characters"),
  keywords: z.string(),
  siteLogo: z.string().optional().nullable(),
  siteFavicon: z.string().optional().nullable(),
  useTextLogo: z.boolean().default(false),
  textLogoColor: z.string().optional(),
  currentTheme: z.string().optional(),
  footerCopyright: z.string().optional(),
  socialFacebook: z.string().optional().nullable(),
  socialTwitter: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  socialDiscord: z.string().optional().nullable(),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteTitle: "",
      metaDescription: "",
      keywords: "",
      siteLogo: "",
      siteFavicon: "",
      useTextLogo: false,
      textLogoColor: "#ffffff",
      currentTheme: "modern",
      footerCopyright: "",
      socialFacebook: "",
      socialTwitter: "",
      socialInstagram: "",
      socialYoutube: "",
      socialDiscord: "",
    }
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        siteTitle: settings.siteTitle || "",
        metaDescription: settings.metaDescription || "",
        keywords: settings.keywords || "",
        siteLogo: settings.siteLogo || "",
        siteFavicon: settings.siteFavicon || "",
        useTextLogo: settings.useTextLogo || false,
        textLogoColor: settings.textLogoColor || "#ffffff",
        currentTheme: settings.currentTheme || "modern",
        footerCopyright: settings.footerCopyright || "",
        socialFacebook: settings.socialFacebook || "",
        socialTwitter: settings.socialTwitter || "",
        socialInstagram: settings.socialInstagram || "",
        socialYoutube: settings.socialYoutube || "",
        socialDiscord: settings.socialDiscord || "",
      });

      // Update the preview images if they exist
      if (settings.siteLogo) {
        setLogoPreview(settings.siteLogo);
      }
      
      if (settings.siteFavicon) {
        setFaviconPreview(settings.siteFavicon);
      }
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      // Handle file uploads first if there are any
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload logo');
        }
        
        const { filePath } = await uploadResponse.json();
        data.siteLogo = filePath;
      }
      
      if (faviconFile) {
        const formData = new FormData();
        formData.append('file', faviconFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload favicon');
        }
        
        const { filePath } = await uploadResponse.json();
        data.siteFavicon = filePath;
      }
      
      // Then update the settings
      const response = await apiRequest('PUT', '/api/settings', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "General settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: GeneralSettingsValues) => {
    updateSettingsMutation.mutate(values);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setFaviconPreview(url);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="homepage">Homepage</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Configure your site's basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="siteTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The title of your website that will appear in the browser tab
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
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormDescription>
                            A short description of your site for search engines (max 160 characters)
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
                          <FormLabel>Meta Keywords</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated keywords related to your website
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentTheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Theme</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Current theme name (e.g., 'modern', 'lunexa')
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>Customize your site's logo and appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="useTextLogo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel>Use Text Logo</FormLabel>
                                <FormDescription>
                                  Use text instead of an image for your logo
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
                      
                      {form.watch("useTextLogo") && (
                        <div>
                          <FormField
                            control={form.control}
                            name="textLogoColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Text Logo Color</FormLabel>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="color" 
                                    className="w-10 h-10 p-1" 
                                    {...field} 
                                  />
                                  <Input 
                                    type="text" 
                                    className="flex-1"
                                    value={field.value} 
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </div>
                                <FormDescription>
                                  Select a color for your text logo
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                    
                    {!form.watch("useTextLogo") && (
                      <div className="space-y-2">
                        <Label htmlFor="logo-upload">Site Logo</Label>
                        <div className="flex items-center gap-4">
                          {(logoPreview || settings?.siteLogo) && (
                            <div className="w-24 h-24 border rounded-md overflow-hidden flex items-center justify-center">
                              <img 
                                src={logoPreview || settings?.siteLogo} 
                                alt="Logo preview" 
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="relative">
                              <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                              />
                              <Label 
                                htmlFor="logo-upload"
                                className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary"
                              >
                                <Upload size={18} />
                                <span>Choose logo file</span>
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Recommended size: 250x70px. PNG or SVG with transparent background.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="favicon-upload">Favicon</Label>
                      <div className="flex items-center gap-4">
                        {(faviconPreview || settings?.siteFavicon) && (
                          <div className="w-12 h-12 border rounded-md overflow-hidden flex items-center justify-center">
                            <img 
                              src={faviconPreview || settings?.siteFavicon} 
                              alt="Favicon preview" 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="relative">
                            <Input
                              id="favicon-upload"
                              type="file"
                              accept="image/x-icon,image/png"
                              onChange={handleFaviconChange}
                              className="hidden"
                            />
                            <Label 
                              htmlFor="favicon-upload"
                              className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary"
                            >
                              <Upload size={18} />
                              <span>Choose favicon file</span>
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Recommended size: 32x32px. ICO or PNG format.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="homepage">
                <Card>
                  <CardHeader>
                    <CardTitle>Homepage Content</CardTitle>
                    <CardDescription>Configure the main content on your homepage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Main headline for your homepage hero section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="heroSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Subtitle</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormDescription>
                            Secondary text below the main headline
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="footer">
                <Card>
                  <CardHeader>
                    <CardTitle>Footer Settings</CardTitle>
                    <CardDescription>Configure the footer of your website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="footerCopyright"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Copyright</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormDescription>
                            Copyright or additional information for your footer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialFacebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialTwitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialInstagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialYoutube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialDiscord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                className="flex items-center gap-2"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}