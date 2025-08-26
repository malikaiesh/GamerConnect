import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HomePageContent, contentStatusEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { BasicTextEditor } from "@/components/admin/basic-text-editor";

// Create a schema for the form
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  status: z.enum(contentStatusEnum.enumValues),
  position: z.number().int().optional(),
});

type HomepageContentFormValues = z.infer<typeof formSchema>;

interface HomepageContentFormProps {
  defaultValues?: Partial<HomepageContentFormValues>;
  onSubmit: (values: HomepageContentFormValues) => Promise<void>;
  isEdit?: boolean;
}

export function HomepageContentForm({
  defaultValues = {
    title: "",
    content: "",
    status: "inactive" as const,
    position: 0,
  },
  onSubmit,
  isEdit = false,
}: HomepageContentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HomepageContentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: HomepageContentFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
      toast({
        title: `Content ${isEdit ? "updated" : "created"} successfully!`,
        description: `The content "${values.title}" has been ${isEdit ? "updated" : "created"}.`,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} content. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter content title" {...field} />
              </FormControl>
              <FormDescription className="text-muted-foreground">
                This title will be displayed as a heading for the content section.
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
              <FormLabel className="text-foreground">Content</FormLabel>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md text-sm border">
                  <div className="font-semibold mb-2 text-foreground">Editor Tools:</div>
                  <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Formatting toolbar</span> - Use the toolbar for bold, italic, lists, and more</li>
                    <li><span className="font-semibold text-foreground">Headings</span> - Select text and choose from heading styles (H1-H5)</li>
                    <li><span className="font-semibold text-foreground">Insert media</span> - Add images directly into your content</li>
                    <li><span className="font-semibold text-foreground">Links</span> - Create and edit hyperlinks in your content</li>
                    <li><span className="font-semibold text-foreground">Tables</span> - Insert and format tables for structured content</li>
                  </ul>
                </div>
                <FormControl>
                  <BasicTextEditor 
                    value={field.value} 
                    onChange={field.onChange}
                    placeholder="Enter rich content with formatting, images, and more..."
                  />
                </FormControl>
              </div>
              <FormDescription className="text-muted-foreground">
                This content can be up to 3000 words. Format your content using the toolbar above. 
                You can insert images, create headings, add links, and more to make your content engaging.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-foreground">Active Status</FormLabel>
                <FormDescription className="text-muted-foreground">
                  Make this content visible on the homepage.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "active"}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? "active" : "inactive")
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">
                {isEdit ? "Updating..." : "Creating..."}
              </span>
              <span className="animate-spin">↻</span>
            </>
          ) : (
            isEdit ? "Update Content" : "Create Content"
          )}
        </Button>
      </form>
    </Form>
  );
}