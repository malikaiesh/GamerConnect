import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HomePageContent, contentStatusEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter content title" {...field} />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Content</FormLabel>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md text-sm border">
                  <div className="font-semibold mb-2">Formatting Guide:</div>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-semibold"># Heading 1</span> - For main headings</li>
                    <li><span className="font-semibold">## Heading 2</span> - For sub-headings</li>
                    <li><span className="font-semibold">**bold text**</span> - For bold text</li>
                    <li><span className="font-semibold">Q: Your question?</span> - For FAQ questions</li>
                    <li><span className="font-semibold">A: Your answer</span> - For FAQ answers</li>
                  </ul>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Enter content text with formatting" 
                    className="min-h-80 font-mono text-sm" 
                    {...field} 
                  />
                </FormControl>
              </div>
              <FormDescription>
                This content can be up to 3000 words. Use double line breaks to separate paragraphs. 
                Use the formatting guide above to create headings, subheadings, FAQs, and bold text.
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
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
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