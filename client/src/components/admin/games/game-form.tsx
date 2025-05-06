import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Game, gameSourceEnum, gameStatusEnum } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the form schema using zod
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  thumbnail: z.string().url({ message: "Thumbnail must be a valid URL" }),
  url: z.string().url({ message: "Game URL must be a valid URL" }).optional().nullable(),
  apiId: z.string().optional().nullable(),
  category: z.string().min(1, { message: "Category is required" }),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim()).filter(Boolean)),
  source: z.enum(["api", "custom"]),
  status: z.enum(["active", "inactive", "featured"]),
  appStoreUrl: z.string().url({ message: "App Store URL must be a valid URL" }).optional().nullable(),
  playStoreUrl: z.string().url({ message: "Play Store URL must be a valid URL" }).optional().nullable(),
  amazonAppStoreUrl: z.string().url({ message: "Amazon App Store URL must be a valid URL" }).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  game?: Game;
  categories: string[];
  onSuccess?: () => void;
}

export function GameForm({ game, categories, onSuccess }: GameFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with default values or existing game data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: game
      ? {
          ...game,
          tags: game.tags.join(", "),
        }
      : {
          title: "",
          description: "",
          thumbnail: "",
          url: "",
          apiId: "",
          category: "",
          tags: "",
          source: "custom" as const,
          status: "active" as const,
          appStoreUrl: "",
          playStoreUrl: "",
          amazonAppStoreUrl: "",
        },
  });

  // Create mutation for adding or updating games
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (game) {
        return apiRequest("PUT", `/api/games/${game.id}`, values);
      } else {
        return apiRequest("POST", "/api/games", values);
      }
    },
    onSuccess: () => {
      toast({
        title: game ? "Game updated" : "Game added",
        description: game ? "The game has been updated successfully." : "The game has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/categories"] });
      if (onSuccess) onSuccess();
      if (!game) form.reset(); // Only reset form on add, not on edit
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
        <CardTitle>{game ? "Edit Game" : "Add New Game"}</CardTitle>
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
                    <Input placeholder="Enter game title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter game description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/game.html" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>For custom games, enter the direct URL to the game</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="api">GameMonetize API</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("source") === "api" && (
                <FormField
                  control={form.control}
                  name="apiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Game ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter GameMonetize game ID" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
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
                      <Input placeholder="action, adventure, racing (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold pt-4">App Download Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="appStoreUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Store URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://apps.apple.com/..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playStoreUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Play Store URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://play.google.com/..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amazonAppStoreUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon App Store URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.amazon.com/..." {...field} value={field.value || ""} />
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
              {game ? "Update Game" : "Add Game"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
