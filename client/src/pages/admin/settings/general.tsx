import { useState, useEffect } from "react";
import AdminNavigation from "@/components/admin/navigation";
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

// Custom URL validator that requires valid URLs when not empty
const urlSchema = z.string()
  .refine(
    val => !val || val === "" || /^https?:\/\//.test(val),
    { message: "Must be a valid URL starting with http:// or https://" }
  )
  .transform(val => val === "" ? null : val) // Convert empty strings to null
  .optional()
  .nullable();

const generalSettingsSchema = z.object({
  siteTitle: z.string().min(3, "Site title must be at least 3 characters"),
  metaDescription: z.string().min(10, "Meta description must be at least 10 characters").max(160, "Meta description should be at most 160 characters"),
  keywords: z.string(),
  siteLogo: urlSchema,
  siteFavicon: urlSchema,
  useTextLogo: z.boolean().default(true),
  textLogoColor: z.string().optional().default('#4f46e5'),
  currentTheme: z.string(),
  adsTxt: z.string().optional(),
  
  // Footer settings
  footerCopyright: z.string().optional(),
  footerAppStoreLink: urlSchema,
  footerGooglePlayLink: urlSchema,
  footerAmazonLink: urlSchema,
  
  // Social media links
  socialFacebook: urlSchema,
  socialTwitter: urlSchema,
  socialInstagram: urlSchema,
  socialYoutube: urlSchema,
  socialDiscord: urlSchema,
  socialWhatsapp: urlSchema,
  socialTiktok: urlSchema,

  // These fields might not be displayed in the form but are needed for validation
  headerAds: z.string().optional(),
  footerAds: z.string().optional(),
  sidebarAds: z.string().optional(),
  contentAds: z.string().optional(),
  floatingHeaderAds: z.string().optional(),
  floatingFooterAds: z.string().optional(),
  paragraph2Ad: z.string().optional().nullable(),
  paragraph4Ad: z.string().optional().nullable(),
  paragraph6Ad: z.string().optional().nullable(),
  paragraph8Ad: z.string().optional().nullable(),
  afterContentAd: z.string().optional().nullable(),
  enableGoogleAds: z.boolean().optional().default(false),
  googleAdClient: z.string().optional().nullable(),
  pushNotificationsEnabled: z.boolean().optional().default(true),
  blogGamesEnabled: z.boolean().optional().default(true),
  customHeaderCode: z.string().optional(),
  customBodyCode: z.string().optional(),
  customFooterCode: z.string().optional(),
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
      useTextLogo: true,
      textLogoColor: "#4f46e5",
      currentTheme: "modern",
      adsTxt: "",
      
      // Footer settings
      footerCopyright: "",
      footerAppStoreLink: "",
      footerGooglePlayLink: "",
      footerAmazonLink: "",
      
      // Social media links
      socialFacebook: "",
      socialTwitter: "",
      socialInstagram: "",
      socialYoutube: "",
      socialDiscord: "",
      socialWhatsapp: "",
      socialTiktok: "",
      
      // Ad placements
      headerAds: "",
      footerAds: "",
      sidebarAds: "",
      contentAds: "",
      floatingHeaderAds: "",
      floatingFooterAds: "",
      paragraph2Ad: null,
      paragraph4Ad: null,
      paragraph6Ad: null,
      paragraph8Ad: null,
      afterContentAd: null,
      
      // Other settings
      enableGoogleAds: false,
      googleAdClient: null,
      pushNotificationsEnabled: true,
      blogGamesEnabled: true,
      customHeaderCode: "",
      customBodyCode: "",
      customFooterCode: "",
    }
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        // Basic site info
        siteTitle: settings.siteTitle || "",
        metaDescription: settings.metaDescription || "",
        keywords: settings.keywords || "",
        siteLogo: settings.siteLogo || "",
        siteFavicon: settings.siteFavicon || "",
        useTextLogo: settings.useTextLogo ?? true,
        textLogoColor: settings.textLogoColor || "#4f46e5",
        currentTheme: settings.currentTheme || "modern",
        adsTxt: settings.adsTxt || "",
        
        // Footer settings
        footerCopyright: settings.footerCopyright || "",
        footerAppStoreLink: settings.footerAppStoreLink || "",
        footerGooglePlayLink: settings.footerGooglePlayLink || "",
        footerAmazonLink: settings.footerAmazonLink || "",
        
        // Social media links
        socialFacebook: settings.socialFacebook || "",
        socialTwitter: settings.socialTwitter || "",
        socialInstagram: settings.socialInstagram || "",
        socialYoutube: settings.socialYoutube || "",
        socialDiscord: settings.socialDiscord || "",
        socialWhatsapp: settings.socialWhatsapp || "",
        socialTiktok: settings.socialTiktok || "",
        
        // Ad placements
        headerAds: settings.headerAds || "",
        footerAds: settings.footerAds || "",
        sidebarAds: settings.sidebarAds || "",
        contentAds: settings.contentAds || "",
        floatingHeaderAds: settings.floatingHeaderAds || "",
        floatingFooterAds: settings.floatingFooterAds || "",
        paragraph2Ad: settings.paragraph2Ad,
        paragraph4Ad: settings.paragraph4Ad,
        paragraph6Ad: settings.paragraph6Ad,
        paragraph8Ad: settings.paragraph8Ad,
        afterContentAd: settings.afterContentAd,
        
        // Other settings
        enableGoogleAds: settings.enableGoogleAds ?? false,
        googleAdClient: settings.googleAdClient,
        pushNotificationsEnabled: settings.pushNotificationsEnabled ?? true,
        blogGamesEnabled: settings.blogGamesEnabled ?? true,
        customHeaderCode: settings.customHeaderCode || "",
        customBodyCode: settings.customBodyCode || "",
        customFooterCode: settings.customFooterCode || "",
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
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Create an error object with the response for better error handling
        const error: any = new Error(responseData.message || 'Error updating settings');
        error.response = response;
        error.data = responseData;
        throw error;
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "General settings have been updated successfully.",
      });
    },
    onError: async (error: any) => {
      console.error("Settings update error:", error);
      
      // Try to extract error details
      let errorMessage = error.message;
      
      if (error.data) {
        console.log("Error data:", error.data);
        
        if (error.data.errors && error.data.errors.length > 0) {
          // Format the validation errors for better readability
          errorMessage = error.data.errors.map((err: any) => 
            `${err.path}: ${err.message}`
          ).join('\n');
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      }
      
      toast({
        title: "Error updating settings",
        description: errorMessage,
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
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pushNotificationsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel>Push Notifications</FormLabel>
                              <FormDescription>
                                Enable push notifications for your website visitors
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
                        name="blogGamesEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel>Blog Games Integration</FormLabel>
                              <FormDescription>
                                Show featured games within blog articles at specific paragraphs
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
              
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Configure your website's social media links</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialFacebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://facebook.com/your-page" />
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
                              <Input {...field} placeholder="https://twitter.com/your-handle" />
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
                              <Input {...field} placeholder="https://instagram.com/your-account" />
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
                              <Input {...field} placeholder="https://youtube.com/c/your-channel" />
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
                              <Input {...field} placeholder="https://discord.gg/your-invite" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialWhatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://wa.me/your-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialTiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://tiktok.com/@your-account" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                    
                    {/* App Store Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <FormField
                        control={form.control}
                        name="footerAppStoreLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>App Store Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://apps.apple.com/app/id123456789" />
                            </FormControl>
                            <FormDescription>
                              Link to your iOS app on the App Store
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
                              <Input {...field} placeholder="https://play.google.com/store/apps/details?id=com.yourapp" />
                            </FormControl>
                            <FormDescription>
                              Link to your Android app on Google Play
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
                            <FormLabel>Amazon Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://amazon.com/your-page" />
                            </FormControl>
                            <FormDescription>
                              Link to your Amazon page or product
                            </FormDescription>
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
    </div>
  );
}