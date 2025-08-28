import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BasicTextEditor } from "@/components/admin/basic-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game } from "@shared/schema";

// Create a schema for game form validation
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  status: z.enum(["active", "inactive", "featured"]),
  source: z.enum(["api", "custom"]),
  thumbnail: z.string().url("Thumbnail must be a valid URL"),
  url: z.string().url("URL must be a valid URL").optional().nullable(),
  apiId: z.string().optional().nullable(),
  
  // New fields for file uploads
  fileType: z.enum(["html5", "apk", "ios", "unity"]).optional().nullable(),
  filePath: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  orientation: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  
  // Screenshot fields
  screenshot1: z.string().url("Screenshot must be a valid URL").optional().nullable(),
  screenshot2: z.string().url("Screenshot must be a valid URL").optional().nullable(),
  screenshot3: z.string().url("Screenshot must be a valid URL").optional().nullable(),
  screenshot4: z.string().url("Screenshot must be a valid URL").optional().nullable(),
  
  // Store URLs
  appStoreUrl: z.string().url("App Store URL must be a valid URL").optional().nullable(),
  playStoreUrl: z.string().url("Play Store URL must be a valid URL").optional().nullable(),
  amazonAppStoreUrl: z.string().url("Amazon App Store URL must be a valid URL").optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  game?: Game;
  onSuccess?: () => void;
}

export function GameForm({ game, onSuccess }: GameFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshot1File, setScreenshot1File] = useState<File | null>(null);
  const [screenshot2File, setScreenshot2File] = useState<File | null>(null);
  const [screenshot3File, setScreenshot3File] = useState<File | null>(null);
  const [screenshot4File, setScreenshot4File] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: game ? {
      ...game,
      // Convert tags array to string for form
      tags: game.tags ? game.tags.join(", ") : "",
      // Ensure proper typing for optional fields
      apiId: game.apiId || null,
      url: game.url || null,
      fileType: game.fileType || null,
      filePath: game.filePath || null,
      fileSize: game.fileSize || null,
      orientation: game.orientation || "landscape",
      instructions: game.instructions || null,
      screenshot1: game.screenshot1 || null,
      screenshot2: game.screenshot2 || null,
      screenshot3: game.screenshot3 || null,
      screenshot4: game.screenshot4 || null,
      appStoreUrl: game.appStoreUrl || null,
      playStoreUrl: game.playStoreUrl || null,
      amazonAppStoreUrl: game.amazonAppStoreUrl || null,
    } : {
      title: "",
      description: "",
      category: "",
      tags: "",
      status: "active",
      source: "custom",
      thumbnail: "",
      url: null,
      apiId: null,
      fileType: null,
      filePath: null,
      fileSize: null,
      orientation: "landscape",
      instructions: null,
      screenshot1: null,
      screenshot2: null,
      screenshot3: null,
      screenshot4: null,
      appStoreUrl: null,
      playStoreUrl: null,
      amazonAppStoreUrl: null,
    },
    mode: "onChange",
  });

  // Query for getting game categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/games/categories"],
    queryFn: async () => {
      const res = await fetch("/api/games/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Mutation for uploading game file
  const uploadGameFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const fileType = form.getValues("fileType");
      if (!fileType) {
        throw new Error("Please select a file type first");
      }
      
      const res = await fetch(`/api/upload/game?type=${fileType}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload game file");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      form.setValue("filePath", data.filePath);
      form.setValue("fileSize", data.fileSize);
      toast({
        title: "Game file uploaded",
        description: "Game file uploaded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for uploading image (thumbnail, screenshots)
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload image");
      }
      
      return res.json();
    },
    onSuccess: (data, variables, context) => {
      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully!",
      });
      return data.imagePath;
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for creating/updating a game
  const gameMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Process form values
      const gameData = {
        ...values,
        // Convert tags string to array
        tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
      };
      
      // Create new game or update existing one
      if (game) {
        return apiRequest(`/api/games/${game.id}`, {
          method: "PUT",
          body: JSON.stringify(gameData)
        });
      } else {
        return apiRequest("/api/games", {
          method: "POST",
          body: JSON.stringify(gameData)
        });
      }
    },
    onSuccess: async () => {
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      
      toast({
        title: game ? "Game updated" : "Game created",
        description: game ? "Game has been updated successfully!" : "Game has been created successfully!",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    // Handle game file upload if a file is selected
    if (gameFile) {
      try {
        await uploadGameFileMutation.mutateAsync(gameFile);
      } catch (error) {
        // The error is already handled in the mutation
        return;
      }
    }
    
    // Handle thumbnail upload if a file is selected
    if (thumbnailFile) {
      try {
        const result = await uploadImageMutation.mutateAsync(thumbnailFile);
        values.thumbnail = `/uploads${result}`;
      } catch (error) {
        // The error is already handled in the mutation
        return;
      }
    }
    
    // Handle screenshot1 upload if a file is selected
    if (screenshot1File) {
      try {
        const result = await uploadImageMutation.mutateAsync(screenshot1File);
        values.screenshot1 = `/uploads${result}`;
      } catch (error) {
        return;
      }
    }
    
    // Handle screenshot2 upload if a file is selected
    if (screenshot2File) {
      try {
        const result = await uploadImageMutation.mutateAsync(screenshot2File);
        values.screenshot2 = `/uploads${result}`;
      } catch (error) {
        return;
      }
    }
    
    // Handle screenshot3 upload if a file is selected
    if (screenshot3File) {
      try {
        const result = await uploadImageMutation.mutateAsync(screenshot3File);
        values.screenshot3 = `/uploads${result}`;
      } catch (error) {
        return;
      }
    }
    
    // Handle screenshot4 upload if a file is selected
    if (screenshot4File) {
      try {
        const result = await uploadImageMutation.mutateAsync(screenshot4File);
        values.screenshot4 = `/uploads${result}`;
      } catch (error) {
        return;
      }
    }
    
    // Submit the form with all data
    await gameMutation.mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="files">Files & Screenshots</TabsTrigger>
            <TabsTrigger value="store">Store Links</TabsTrigger>
          </TabsList>
          
          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Game title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Category */}
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter game description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="action, adventure, puzzle (comma separated)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
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
              
              {/* Source */}
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
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Conditional fields based on source */}
            {form.watch("source") === "api" && (
              <FormField
                control={form.control}
                name="apiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Game ID</FormLabel>
                    <FormControl>
                      <Input placeholder="API Game ID" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      The ID of the game in the external API
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {form.watch("source") === "custom" && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/game" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      External URL for the game (optional for custom games)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Thumbnail */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <Input
                        placeholder="https://example.com/thumbnail.png"
                        {...field}
                        className={thumbnailFile ? "hidden" : ""}
                      />
                      <FileUpload
                        onFileSelect={setThumbnailFile}
                        accept="image/*"
                        maxSize={5} // 5MB
                        label="Upload Thumbnail"
                        initialValue={field.value}
                        className="mt-2"
                        buttonText="Choose Image"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter a URL or upload an image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Files & Screenshots Tab */}
          <TabsContent value="files" className="space-y-4">
            {form.watch("source") === "custom" && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Game File Upload</h3>
                  
                  {/* File Type Selection */}
                  <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="html5">HTML5</SelectItem>
                            <SelectItem value="apk">Android (APK)</SelectItem>
                            <SelectItem value="ios">iOS</SelectItem>
                            <SelectItem value="unity">Unity WebGL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of game file you want to upload
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* File Upload */}
                  {form.watch("fileType") && (
                    <>
                      <div>
                        <FileUpload
                          onFileSelect={setGameFile}
                          onFileUpload={uploadGameFileMutation.mutateAsync}
                          accept={getAcceptTypeForFileType(form.watch("fileType"))}
                          maxSize={500} // 500MB
                          label="Upload Game File"
                          buttonText="Choose File"
                        />
                        {form.watch("filePath") && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Current file: {form.watch("filePath")} ({formatBytes(form.watch("fileSize") || 0)})
                          </div>
                        )}
                      </div>
                      
                      {/* Orientation */}
                      <FormField
                        control={form.control}
                        name="orientation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game Orientation</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || "landscape"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select orientation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="landscape">Landscape</SelectItem>
                                <SelectItem value="portrait">Portrait</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Instructions */}
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game Instructions</FormLabel>
                            <FormControl>
                              <BasicTextEditor
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Enter game instructions..."
                              />
                            </FormControl>
                            <FormDescription>
                              Explain how to play the game, controls, etc. You can add images, videos, and formatted text.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Screenshots */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Game Screenshots (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Screenshot 1 */}
                  <FormField
                    control={form.control}
                    name="screenshot1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screenshot 1</FormLabel>
                        <FormControl>
                          <FileUpload
                            onFileSelect={setScreenshot1File}
                            accept="image/*"
                            maxSize={5} // 5MB
                            initialValue={field.value || ""}
                            buttonText="Choose Image"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Screenshot 2 */}
                  <FormField
                    control={form.control}
                    name="screenshot2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screenshot 2</FormLabel>
                        <FormControl>
                          <FileUpload
                            onFileSelect={setScreenshot2File}
                            accept="image/*"
                            maxSize={5} // 5MB
                            initialValue={field.value || ""}
                            buttonText="Choose Image"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Screenshot 3 */}
                  <FormField
                    control={form.control}
                    name="screenshot3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screenshot 3</FormLabel>
                        <FormControl>
                          <FileUpload
                            onFileSelect={setScreenshot3File}
                            accept="image/*"
                            maxSize={5} // 5MB
                            initialValue={field.value || ""}
                            buttonText="Choose Image"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Screenshot 4 */}
                  <FormField
                    control={form.control}
                    name="screenshot4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screenshot 4</FormLabel>
                        <FormControl>
                          <FileUpload
                            onFileSelect={setScreenshot4File}
                            accept="image/*"
                            maxSize={5} // 5MB
                            initialValue={field.value || ""}
                            buttonText="Choose Image"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Store Links Tab */}
          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">App Store Links (Optional)</h3>
                
                {/* App Store URL */}
                <FormField
                  control={form.control}
                  name="appStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Store URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://apps.apple.com/app/id..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Link to the iOS App Store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Play Store URL */}
                <FormField
                  control={form.control}
                  name="playStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Play URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://play.google.com/store/apps/details?id=..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Link to Google Play Store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Amazon App Store URL */}
                <FormField
                  control={form.control}
                  name="amazonAppStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amazon App Store URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.amazon.com/dp/..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Link to Amazon App Store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={gameMutation.isPending || uploadGameFileMutation.isPending || uploadImageMutation.isPending}>
            {game ? "Update Game" : "Create Game"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper function to get the accept string for file type
function getAcceptTypeForFileType(fileType: string | null | undefined): string {
  switch (fileType) {
    case "html5":
    case "unity":
      return ".zip,.rar,.7z";
    case "apk":
      return ".apk";
    case "ios":
      return ".ipa";
    default:
      return "*/*";
  }
}

// Helper function to format file size in bytes to human-readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}