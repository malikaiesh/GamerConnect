import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

// Define the form schema using zod
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  slug: z.string().min(5, { message: "Slug must be at least 5 characters" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters" }),
  featuredImage: z.string().url({ message: "Featured image must be a valid URL" }),
  categoryId: z.coerce.number().min(1, { message: "Category is required" }),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim()).filter(Boolean)),
  status: z.enum(["draft", "published"]),
  author: z.string().min(2, { message: "Author name is required" }),
  authorAvatar: z.string().url({ message: "Author avatar must be a valid URL" }).optional().nullable(),
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

  // Fetch blog categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });

  // Initialize form with default values or existing post data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: post
      ? {
          ...post,
          tags: post.tags ? post.tags.join(", ") : "",
          categoryId: post.categoryId || 0,
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
      if (post) {
        return apiRequest("PUT", `/api/blog/posts/${post.id}`, values);
      } else {
        return apiRequest("POST", "/api/blog/posts", values);
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
                  <FormLabel>Title</FormLabel>
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="my-blog-post" {...field} />
                      </FormControl>
                      <FormDescription>Used for the URL (e.g., /blog/my-blog-post)</FormDescription>
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
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
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
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Tags</FormLabel>
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
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief summary of the post" rows={2} {...field} />
                  </FormControl>
                  <FormDescription>A brief summary that appears in post listings</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="border rounded-md">
                      <RichTextEditor
                        id="blog-content-editor"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Author</FormLabel>
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
                    <FormLabel>Author Avatar URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ""} />
                    </FormControl>
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
