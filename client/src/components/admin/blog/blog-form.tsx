import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BlogPost, BlogCategory, blogStatusEnum } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { BasicTextEditor } from "@/components/admin/basic-text-editor";

// Define the form schema using zod
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  slug: z.string().min(5, { message: "Slug must be at least 5 characters" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters" }),
  featuredImage: z.string().min(1, { message: "Featured image is required" }).refine((val) => {
    // Allow local file paths (starting with /) or valid URLs
    if (val.startsWith('/')) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Featured image must be a valid URL or uploaded image" }),
  categoryId: z.coerce.number().min(1, { message: "Category is required" }),
  tags: z.string(),
  status: z.enum(["draft", "published"]),
  author: z.string().min(2, { message: "Author name is required" }),
  authorAvatar: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Allow empty
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Author avatar must be a valid URL or left empty" }),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogFormProps {
  post?: BlogPost;
  onSuccess?: () => void;
}

export function BlogForm({ post, onSuccess }: BlogFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // File input refs
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const authorAvatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch blog categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });

  // Initialize form with default values or existing post data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          categoryId: post.categoryId || 0,
          tags: post.tags ? post.tags.join(", ") : "",
          status: post.status,
          author: post.author,
          authorAvatar: post.authorAvatar || "",
        }
      : {
          title: "",
          slug: "",
          content: "",
          excerpt: "",
          featuredImage: "",
          categoryId: 0,
          tags: "",
          status: "draft" as const,
          author: "",
          authorAvatar: "",
        },
  });

  // Function to generate slug from title
  const generateSlug = () => {
    const title = form.getValues().title;
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue("slug", slug);
    }
  };

  // Create mutation for adding or updating posts
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Transform tags from string to array
      const transformedValues = {
        ...values,
        tags: values.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      };
      
      if (post) {
        return apiRequest("PUT", `/api/blog/posts/${post.id}`, transformedValues);
      } else {
        return apiRequest("POST", "/api/blog/posts", transformedValues);
      }
    },
    onSuccess: () => {
      toast({
        title: post ? "Post updated" : "Post added",
        description: post ? "The post has been updated successfully." : "The post has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      if (onSuccess) onSuccess();
      if (!post) form.reset(); // Only reset form on add, not on edit
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload function
  const handleFileUpload = async (file: File, fieldName: 'featuredImage' | 'authorAvatar') => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // Changed from 'image' to 'file'
      
      const response = await fetch('/api/upload-image', { // Changed from '/api/upload/image' to '/api/upload-image'
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
      
      const data = await response.json();
      form.setValue(fieldName, data.location); // Changed from data.url to data.location
      
      toast({
        title: "Upload successful",
        description: `${fieldName === 'featuredImage' ? 'Featured image' : 'Author avatar'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-foreground">{post ? "Edit Blog Post" : "Add New Blog Post"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="my-blog-post" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">Used for the URL (e.g., /blog/my-blog-post)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate from Title
              </Button>
            </div>

            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Featured Image</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={featuredImageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'featuredImage');
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => featuredImageInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1"
                      >
                        <Upload size={16} />
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange('')}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                          Clear
                        </Button>
                      )}
                    </div>
                    {field.value && (
                      <div className="mt-2">
                        <img src={field.value} alt="Featured" className="max-w-32 h-20 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                  <FormDescription className="text-muted-foreground">
                    Enter a URL or upload an image from your computer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="text-foreground">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="gaming, strategy, review (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief summary of the post" rows={2} {...field} />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">A brief summary that appears in post listings</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-foreground">Content</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      id="blog-content-editor"
                      value={field.value}
                      onChange={field.onChange}
                      height={400}
                      placeholder="Write your blog post content here using Markdown formatting..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-foreground">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorAvatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Author Avatar (optional)</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={authorAvatarInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'authorAvatar');
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => authorAvatarInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1"
                        >
                          <Upload size={16} />
                          {isUploading ? 'Uploading...' : 'Upload Avatar'}
                        </Button>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange('')}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                            Clear
                          </Button>
                        )}
                      </div>
                      {field.value && (
                        <div className="mt-2">
                          <img src={field.value} alt="Author Avatar" className="w-12 h-12 object-cover rounded-full border" />
                        </div>
                      )}
                    </div>
                    <FormDescription className="text-muted-foreground">
                      Enter a URL or upload an avatar image from your computer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending || isUploading}>
              {(mutation.isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {post ? "Update Post" : "Add Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
