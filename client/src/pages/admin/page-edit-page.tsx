import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { pageTypeEnum, contentStatusEnum } from "@/lib/constants";
import { BasicTextEditor } from "@/components/admin/basic-text-editor";
import { InsertStaticPage, StaticPage } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  pageType: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function PageEditPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const isNew = id === "new" || location.includes('/pages/new');
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      pageType: "custom",
      metaTitle: "",
      metaDescription: "",
      status: "active",
    },
  });

  // Fetch page data if editing
  const { data: page, isLoading: pageLoading } = useQuery<StaticPage>({
    queryKey: [`/api/pages/${id}`],
    queryFn: () => fetch(`/api/pages/${id}`).then(res => res.json()),
    enabled: !isNew && !!id,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isNew) {
        return apiRequest("/api/pages", { method: "POST", body: JSON.stringify(values) });
      } else {
        return apiRequest(`/api/pages/${id}`, { method: "PUT", body: JSON.stringify(values) });
      }
    },
    onSuccess: () => {
      toast({
        title: isNew ? "Page created" : "Page updated",
        description: isNew
          ? "Your new page has been created successfully."
          : "Your page has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setLocation("/admin/pages");
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      if (error.message.includes('slug already exists')) {
        errorMessage = `A page with this URL slug already exists. Please try a different slug or modify the title.`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/pages/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setLocation("/admin/pages");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Populate form when page data is loaded
  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content,
        pageType: page.pageType,
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        status: page.status as "active" | "inactive",
      });
    }
  }, [page, form]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Watch title changes and auto-generate slug for new pages
  const titleValue = form.watch("title");
  useEffect(() => {
    if (isNew && titleValue && !form.getValues("slug")) {
      const newSlug = generateSlug(titleValue);
      form.setValue("slug", newSlug);
    }
  }, [titleValue, isNew, form]);

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  if (!user?.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isNew && pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => setLocation("/admin/pages")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Create New Page" : `Edit Page: ${page?.title}`}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Create a new static page for your website" : "Edit content and settings for this page"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>{isNew ? "Create New Page" : "Edit Page"}</CardTitle>
                  <CardDescription>
                    {isNew
                      ? "Create a new static page for your website."
                      : "Update the content and settings of this page."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter page title"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Only auto-generate slug if it's a new page and slug is empty
                                  if (isNew && !form.getValues("slug")) {
                                    form.setValue("slug", generateSlug(e.target.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input placeholder="page-url-slug" {...field} />
                            </FormControl>
                            <FormDescription>
                              The URL-friendly version of the title that will appear in the page's URL.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <BasicTextEditor
                                id="page-content"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter page content..."
                              />
                            </FormControl>
                            <FormDescription>
                              Use the rich text editor tools for formatting with headings, lists, images, and other elements.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="seo" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="SEO Title (Leave empty to use page title)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The title that appears in search engine results. Leave empty to use the page title.
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
                                placeholder="Enter a description for search engines..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description of the page for search engines. Recommended 150-160 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/pages")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNew ? "Create Page" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {!isNew && (
                <div className="mt-6">
                  <Alert variant="destructive" className="border-destructive/20 text-destructive">
                    <AlertTitle>Danger Zone</AlertTitle>
                    <AlertDescription>
                      <p className="mb-4">
                        Deleting this page will permanently remove it. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        type="button"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Page
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Page Settings</CardTitle>
                  <CardDescription>
                    Configure the page type and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select page type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(pageTypeEnum.enumValues).map(([type]) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of static page you are creating
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the visibility status of this page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}