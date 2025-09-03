import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Languages, 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  BarChart3, 
  Settings,
  Flag,
  Type,
  Search
} from "lucide-react";

// Types
interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Translation {
  id: number;
  translationKey: string;
  languageCode: string;
  translatedText: string;
  category: string;
  isActive: boolean;
  languageName: string;
  languageNativeName: string;
  createdAt: string;
  updatedAt: string;
}

interface SiteSettings {
  translationEnabled: boolean;
  defaultLanguage: string;
  autoDetectLanguage: boolean;
  showLanguageSelectorOnHomepage: boolean;
}

// Validation schemas
const languageSchema = z.object({
  code: z.string().min(2, "Language code must be at least 2 characters").max(5, "Language code must be less than 5 characters"),
  name: z.string().min(1, "Language name is required").max(50, "Name must be less than 50 characters"),
  nativeName: z.string().min(1, "Native name is required").max(50, "Native name must be less than 50 characters"),
  flag: z.string().min(1, "Flag is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, "Sort order must be non-negative").default(0)
});

const translationSchema = z.object({
  translationKey: z.string().min(1, "Translation key is required").max(100, "Key must be less than 100 characters"),
  languageCode: z.string().min(2, "Language code is required"),
  translatedText: z.string().min(1, "Translated text is required"),
  category: z.string().min(1, "Category is required").max(50, "Category must be less than 50 characters").default("general"),
  isActive: z.boolean().default(true)
});

export function TranslationSettings() {
  const [activeTab, setActiveTab] = useState("settings");
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch site settings
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  // Fetch languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ['/api/translations/languages'],
  });

  // Fetch active languages
  const { data: activeLanguages = [] } = useQuery<Language[]>({
    queryKey: ['/api/translations/languages/active'],
  });

  // Fetch translations with filters
  const { data: translationsData } = useQuery({
    queryKey: ['/api/translations/admin/translations', { 
      search: searchTerm, 
      languageCode: selectedLanguageFilter !== 'all' ? selectedLanguageFilter : undefined,
      category: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined
    }],
  });

  // Fetch translation categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/translations/categories'],
  });

  // Fetch translation statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/translations/admin/stats'],
  });

  // Forms
  const languageForm = useForm<z.infer<typeof languageSchema>>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      code: "",
      name: "",
      nativeName: "",
      flag: "",
      isActive: true,
      sortOrder: 0
    }
  });

  const translationForm = useForm<z.infer<typeof translationSchema>>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      translationKey: "",
      languageCode: "",
      translatedText: "",
      category: "general",
      isActive: true
    }
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  });

  const saveLanguageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof languageSchema>) => {
      const url = editingLanguage 
        ? `/api/translations/languages/${editingLanguage.code}`
        : '/api/translations/languages';
      const method = editingLanguage ? 'PUT' : 'POST';
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ 
        title: editingLanguage ? "Language updated successfully" : "Language created successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/translations/languages'] });
      setIsLanguageDialogOpen(false);
      setEditingLanguage(null);
      languageForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to save language", variant: "destructive" });
    }
  });

  const saveTranslationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof translationSchema>) => {
      const url = editingTranslation 
        ? `/api/translations/translations/${editingTranslation.id}`
        : '/api/translations/translations';
      const method = editingTranslation ? 'PUT' : 'POST';
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ 
        title: editingTranslation ? "Translation updated successfully" : "Translation created successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/translations/admin/translations'] });
      setIsTranslationDialogOpen(false);
      setEditingTranslation(null);
      translationForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to save translation", variant: "destructive" });
    }
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: async (code: string) => {
      await apiRequest(`/api/translations/languages/${code}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "Language deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/translations/languages'] });
    },
    onError: () => {
      toast({ title: "Failed to delete language", variant: "destructive" });
    }
  });

  const deleteTranslationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/translations/translations/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "Translation deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/translations/admin/translations'] });
    },
    onError: () => {
      toast({ title: "Failed to delete translation", variant: "destructive" });
    }
  });

  // Handlers
  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    languageForm.reset({
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag,
      isActive: language.isActive,
      sortOrder: language.sortOrder
    });
    setIsLanguageDialogOpen(true);
  };

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation);
    translationForm.reset({
      translationKey: translation.translationKey,
      languageCode: translation.languageCode,
      translatedText: translation.translatedText,
      category: translation.category,
      isActive: translation.isActive
    });
    setIsTranslationDialogOpen(true);
  };

  const handleAddLanguage = () => {
    setEditingLanguage(null);
    languageForm.reset();
    setIsLanguageDialogOpen(true);
  };

  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.reset();
    setIsTranslationDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Multi-Language Translation System
          </CardTitle>
          <CardDescription>
            Manage languages and translations for your website
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Languages
          </TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Translations
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Translation Settings</CardTitle>
              <CardDescription>
                Configure global translation settings for your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="translation-enabled">Enable Translations</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow users to switch between different languages
                  </div>
                </div>
                <Switch
                  id="translation-enabled"
                  checked={settings?.translationEnabled || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ translationEnabled: checked });
                  }}
                  data-testid="switch-translation-enabled"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-detect">Auto-detect Language</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically detect user's preferred language from browser
                  </div>
                </div>
                <Switch
                  id="auto-detect"
                  checked={settings?.autoDetectLanguage || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ autoDetectLanguage: checked });
                  }}
                  data-testid="switch-auto-detect-language"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-selector">Show Language Selector on Homepage</Label>
                  <div className="text-sm text-muted-foreground">
                    Display language selector on the homepage for easy access
                  </div>
                </div>
                <Switch
                  id="show-selector"
                  checked={settings?.showLanguageSelectorOnHomepage || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ showLanguageSelectorOnHomepage: checked });
                  }}
                  data-testid="switch-show-language-selector"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-language">Default Language</Label>
                <Select 
                  value={settings?.defaultLanguage || "en"}
                  onValueChange={(value) => {
                    updateSettingsMutation.mutate({ defaultLanguage: value });
                  }}
                >
                  <SelectTrigger data-testid="select-default-language">
                    <SelectValue placeholder="Select default language" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Language Management</CardTitle>
              <CardDescription>
                Add, edit, or remove supported languages
              </CardDescription>
              <div className="flex justify-between items-center">
                <div />
                <Button onClick={handleAddLanguage} data-testid="button-add-language">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flag</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Native Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((language) => (
                    <TableRow key={language.id} data-testid={`row-language-${language.code}`}>
                      <TableCell className="text-2xl">{language.flag}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{language.code}</Badge>
                      </TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell>{language.nativeName}</TableCell>
                      <TableCell>
                        <Badge variant={language.isActive ? "default" : "secondary"}>
                          {language.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{language.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLanguage(language)}
                            data-testid={`button-edit-language-${language.code}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${language.name}?`)) {
                                deleteLanguageMutation.mutate(language.code);
                              }
                            }}
                            data-testid={`button-delete-language-${language.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle>Translation Management</CardTitle>
              <CardDescription>
                Manage translations for different languages and text elements
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search translations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-translations"
                    />
                  </div>
                </div>
                <Select value={selectedLanguageFilter} onValueChange={setSelectedLanguageFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-filter-language">
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-filter-category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTranslation} data-testid="button-add-translation">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Translation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {translationsData?.translations?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Translation</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {translationsData.translations.map((translation: Translation) => (
                      <TableRow key={translation.id} data-testid={`row-translation-${translation.id}`}>
                        <TableCell>
                          <Badge variant="outline">{translation.translationKey}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{languages.find(l => l.code === translation.languageCode)?.flag}</span>
                            <span>{translation.languageName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{translation.translatedText}</TableCell>
                        <TableCell>
                          <Badge>{translation.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={translation.isActive ? "default" : "secondary"}>
                            {translation.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTranslation(translation)}
                              data-testid={`button-edit-translation-${translation.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this translation?`)) {
                                  deleteTranslationMutation.mutate(translation.id);
                                }
                              }}
                              data-testid={`button-delete-translation-${translation.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No translations found</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first translation</p>
                  <Button onClick={handleAddTranslation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Translation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLanguages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
                <Type className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTranslations || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          {stats?.languageStats?.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Translations by Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.languageStats.map((stat: any) => (
                    <div key={stat.languageCode} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{languages.find(l => l.code === stat.languageCode)?.flag}</span>
                        <span>{stat.languageName}</span>
                      </div>
                      <Badge variant="secondary">{stat.translationCount} translations</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Language Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingLanguage ? "Edit Language" : "Add New Language"}
            </DialogTitle>
          </DialogHeader>
          <Form {...languageForm}>
            <form onSubmit={languageForm.handleSubmit((data) => saveLanguageMutation.mutate(data))} className="space-y-4">
              <FormField
                control={languageForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Code</FormLabel>
                    <FormControl>
                      <Input placeholder="en" {...field} data-testid="input-language-code" />
                    </FormControl>
                    <FormDescription>ISO 639-1 language code (e.g., en, es, fr)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={languageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Name</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} data-testid="input-language-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={languageForm.control}
                name="nativeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Native Name</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} data-testid="input-language-native-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={languageForm.control}
                name="flag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flag Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="🇺🇸" {...field} data-testid="input-language-flag" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={languageForm.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-language-sort-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={languageForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Make this language available for translation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-language-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLanguageDialogOpen(false)}
                  data-testid="button-cancel-language"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveLanguageMutation.isPending}
                  data-testid="button-save-language"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveLanguageMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Translation Dialog */}
      <Dialog open={isTranslationDialogOpen} onOpenChange={setIsTranslationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? "Edit Translation" : "Add New Translation"}
            </DialogTitle>
          </DialogHeader>
          <Form {...translationForm}>
            <form onSubmit={translationForm.handleSubmit((data) => saveTranslationMutation.mutate(data))} className="space-y-4">
              <FormField
                control={translationForm.control}
                name="translationKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Translation Key</FormLabel>
                    <FormControl>
                      <Input placeholder="nav.home" {...field} data-testid="input-translation-key" />
                    </FormControl>
                    <FormDescription>Unique key for this translation (e.g., nav.home, common.welcome)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={translationForm.control}
                name="languageCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-translation-language">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={translationForm.control}
                name="translatedText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Translated Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Home" 
                        {...field} 
                        data-testid="textarea-translation-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={translationForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="navigation" {...field} data-testid="input-translation-category" />
                    </FormControl>
                    <FormDescription>Group translations by category (e.g., navigation, common, pages)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={translationForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Make this translation available for use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-translation-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTranslationDialogOpen(false)}
                  data-testid="button-cancel-translation"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveTranslationMutation.isPending}
                  data-testid="button-save-translation"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveTranslationMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}