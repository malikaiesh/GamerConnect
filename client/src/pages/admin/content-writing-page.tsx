import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BrainCircuit, FileText, Image, Languages, Loader2, PenTool, Rocket, Settings, Sparkles, Target, Upload, Zap, Bot, Eye, Save, Send, RotateCcw, Copy, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin/navigation";

// Content Writing Form Schema
const contentWritingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  topic: z.string().min(1, "Topic is required"),
  aiModel: z.enum(["chatgpt", "claude", "google_gemini"]),
  contentType: z.enum(["blog_post", "article", "tutorial", "review", "news", "guide"]),
  tone: z.enum(["professional", "casual", "friendly", "authoritative", "conversational", "technical"]),
  wordCount: z.number().min(200).max(5000),
  targetAudience: z.string().min(1, "Target audience is required"),
  keywords: z.string().min(1, "Keywords are required"),
  metaDescription: z.string().min(1, "Meta description is required").max(160, "Meta description must be under 160 characters"),
  categoryId: z.number().min(1, "Category is required"),
  generateImages: z.boolean().default(false),
  includeConclusion: z.boolean().default(true),
  includeFAQ: z.boolean().default(false),
  autoPublish: z.boolean().default(false),
  scheduleDate: z.string().optional(),
});

type ContentWritingForm = z.infer<typeof contentWritingSchema>;

interface AIGenerationStatus {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  generatedContent?: {
    title: string;
    content: string;
    metaDescription: string;
    keywords: string[];
    images?: Array<{ url: string; altText: string; caption: string }>;
    readingTime: number;
    seoScore: number;
  };
}

// Content Templates
const contentTemplates = [
  {
    id: 'gaming_review',
    name: 'Game Review',
    description: 'Professional game review with pros, cons, and rating',
    icon: '🎮',
    prompts: {
      structure: 'Introduction → Gameplay → Graphics → Story → Pros & Cons → Rating → Conclusion',
      tone: 'professional',
      contentType: 'review'
    }
  },
  {
    id: 'gaming_news',
    name: 'Gaming News',
    description: 'Breaking news and updates in the gaming industry',
    icon: '📰',
    prompts: {
      structure: 'Headline → Summary → Details → Impact → Conclusion',
      tone: 'professional',
      contentType: 'news'
    }
  },
  {
    id: 'gaming_guide',
    name: 'Gaming Guide',
    description: 'Step-by-step tutorial or walkthrough',
    icon: '📚',
    prompts: {
      structure: 'Introduction → Prerequisites → Step-by-step → Tips → Conclusion',
      tone: 'friendly',
      contentType: 'guide'
    }
  },
  {
    id: 'game_tips',
    name: 'Game Tips & Tricks',
    description: 'Helpful tips and strategies for games',
    icon: '💡',
    prompts: {
      structure: 'Introduction → Basic Tips → Advanced Strategies → Common Mistakes → Conclusion',
      tone: 'casual',
      contentType: 'tutorial'
    }
  }
];

export default function ContentWritingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<AIGenerationStatus>({
    status: 'idle',
    progress: 0,
    currentStep: '',
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch blog categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/blog/categories'],
  });

  // Fetch available AI models from API keys
  const { data: apiKeys = [] } = useQuery({
    queryKey: ['/api/api-keys'],
  });

  const aiModels = apiKeys.filter((key: any) => 
    ['chatgpt', 'claude', 'google_gemini'].includes(key.type) && key.isActive
  );

  const form = useForm<ContentWritingForm>({
    resolver: zodResolver(contentWritingSchema),
    defaultValues: {
      aiModel: 'chatgpt',
      contentType: 'blog_post',
      tone: 'professional',
      wordCount: 1000,
      generateImages: false,
      includeConclusion: true,
      includeFAQ: false,
      autoPublish: false,
    },
  });

  // AI Content Generation Mutation
  const generateContentMutation = useMutation({
    mutationFn: async (data: ContentWritingForm) => {
      setGenerationStatus({
        status: 'generating',
        progress: 0,
        currentStep: 'Initializing AI model...',
      });

      const response = await apiRequest('POST', '/api/ai/generate-content', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGenerationStatus({
        status: 'completed',
        progress: 100,
        currentStep: 'Content generated successfully!',
        generatedContent: data,
      });
      toast({
        title: "Content Generated Successfully",
        description: "Your AI-powered content is ready for review and publishing.",
      });
    },
    onError: (error: any) => {
      setGenerationStatus({
        status: 'error',
        progress: 0,
        currentStep: 'Generation failed',
      });
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Publish to Blog Mutation
  const publishToBlogMutation = useMutation({
    mutationFn: async (content: any) => {
      const response = await apiRequest('POST', '/api/blog/posts', {
        title: content.title,
        content: content.content,
        metaDescription: content.metaDescription,
        categoryId: form.getValues('categoryId'),
        status: form.getValues('autoPublish') ? 'published' : 'draft',
        authorId: user?.id,
        tags: content.keywords.join(','),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Published Successfully",
        description: "Your content has been published to the blog.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish content.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContentWritingForm) => {
    generateContentMutation.mutate(data);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    form.setValue('contentType', template.prompts.contentType);
    form.setValue('tone', template.prompts.tone);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to your content settings.`,
    });
  };

  const handlePublishContent = () => {
    if (generationStatus.generatedContent) {
      publishToBlogMutation.mutate(generationStatus.generatedContent);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need admin privileges to access the Content Writing section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 flex-wrap">
                <BrainCircuit className="h-8 w-8 text-primary" />
                AI Content Writing
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                  Powered by AI
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-2">
                Generate SEO-optimized, human-like content using advanced AI models and publish directly to your blog.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className={cn(previewMode && "bg-primary/10")}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Content Templates */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    <Sparkles className="h-5 w-5 flex-shrink-0" />
                    <span className="break-words">Content Templates</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Quick start with pre-built templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contentTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{template.icon}</span>
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="generate" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Generate Content
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview & Edit
                  </TabsTrigger>
                  <TabsTrigger value="publish" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Publish
                  </TabsTrigger>
                </TabsList>

                {/* Generate Content Tab */}
                <TabsContent value="generate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription>
                    Configure your content parameters and let AI create SEO-optimized content for you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Basic Information
                          </h3>
                          
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Content Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your content title..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Topic/Subject</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe what you want to write about..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Be specific about the topic, key points, and any particular angle you want to cover.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blog Category</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category: any) => (
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
                        </div>

                        {/* AI Configuration */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            AI Configuration
                          </h3>

                          <FormField
                            control={form.control}
                            name="aiModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>AI Model</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select AI model" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {aiModels.map((model: any) => (
                                      <SelectItem key={model.type} value={model.type}>
                                        <div className="flex items-center gap-2">
                                          <Bot className="h-4 w-4" />
                                          {model.name}
                                          {model.type === 'chatgpt' && <Badge variant="outline">Recommended</Badge>}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose the AI model for content generation. ChatGPT is recommended for most content types.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Content Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select content type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="blog_post">Blog Post</SelectItem>
                                    <SelectItem value="article">Article</SelectItem>
                                    <SelectItem value="tutorial">Tutorial</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="news">News</SelectItem>
                                    <SelectItem value="guide">Guide</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Writing Tone</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="friendly">Friendly</SelectItem>
                                    <SelectItem value="authoritative">Authoritative</SelectItem>
                                    <SelectItem value="conversational">Conversational</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wordCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Word Count: {field.value}</FormLabel>
                                <FormControl>
                                  <Slider
                                    min={200}
                                    max={5000}
                                    step={100}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Choose the target word count for your content (200-5000 words).
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* SEO Optimization */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          SEO Optimization
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Audience</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Gaming enthusiasts, beginners..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  Define who your content is for to optimize tone and complexity.
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
                                <FormLabel>Keywords</FormLabel>
                                <FormControl>
                                  <Input placeholder="gaming, tips, strategy (comma-separated)" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter keywords for SEO optimization, separated by commas.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name="metaDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Brief description for search engines (max 160 characters)..."
                                      className="min-h-[80px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/160 characters - This will appear in search results.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Advanced Options */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Advanced Options
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="generateImages"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Generate Images</FormLabel>
                                    <FormDescription>
                                      AI will generate relevant images with alt-text
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
                              name="includeConclusion"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Include Conclusion</FormLabel>
                                    <FormDescription>
                                      Add a summary conclusion section
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

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="includeFAQ"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Include FAQ Section</FormLabel>
                                    <FormDescription>
                                      Add frequently asked questions
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
                              name="autoPublish"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Auto-Publish</FormLabel>
                                    <FormDescription>
                                      Publish immediately after generation
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
                        </div>
                      </div>

                      {/* Generation Status */}
                      {generationStatus.status !== 'idle' && (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold flex items-center gap-2">
                                  {generationStatus.status === 'generating' && <Loader2 className="h-5 w-5 animate-spin" />}
                                  {generationStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                  {generationStatus.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                  Content Generation
                                </h4>
                                <Badge 
                                  variant={
                                    generationStatus.status === 'completed' ? 'default' :
                                    generationStatus.status === 'error' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {generationStatus.status.charAt(0).toUpperCase() + generationStatus.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <Progress value={generationStatus.progress} className="w-full" />
                              <p className="text-sm text-muted-foreground">{generationStatus.currentStep}</p>
                              
                              {generationStatus.generatedContent && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                    ✨ Content Generated Successfully!
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Word Count</p>
                                      <p className="font-medium">{generationStatus.generatedContent.content.split(' ').length}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Reading Time</p>
                                      <p className="font-medium">{generationStatus.generatedContent.readingTime} min</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">SEO Score</p>
                                      <p className="font-medium">{generationStatus.generatedContent.seoScore}/100</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Keywords</p>
                                      <p className="font-medium">{generationStatus.generatedContent.keywords.length} found</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-center">
                        <Button 
                          type="submit" 
                          size="lg" 
                          disabled={generateContentMutation.isPending || aiModels.length === 0}
                          className="px-8"
                        >
                          {generateContentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Generating Content...
                            </>
                          ) : (
                            <>
                              <Rocket className="mr-2 h-5 w-5" />
                              Generate AI Content
                            </>
                          )}
                        </Button>
                      </div>

                      {aiModels.length === 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>No AI Models Available</AlertTitle>
                          <AlertDescription>
                            Please configure at least one AI model (ChatGPT, Claude, or Google Gemini) in your API Keys section to use content generation.
                          </AlertDescription>
                        </Alert>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview & Edit Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview & Edit Generated Content
                  </CardTitle>
                  <CardDescription>
                    Review and edit your AI-generated content before publishing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generationStatus.generatedContent ? (
                    <div className="space-y-6">
                      {/* Content Preview */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Generated Content</h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generationStatus.generatedContent?.content || '')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Content
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGenerationStatus(prev => ({ ...prev, generatedContent: undefined }))}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
                          <h1 className="text-2xl font-bold mb-4">{generationStatus.generatedContent.title}</h1>
                          <div 
                            className="prose prose-gray dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: generationStatus.generatedContent.content }}
                          />
                        </div>
                      </div>

                      {/* SEO Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">SEO Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                              <p className="text-sm">{generationStatus.generatedContent.metaDescription}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Keywords</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {generationStatus.generatedContent.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">SEO Score</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={generationStatus.generatedContent.seoScore} className="flex-1" />
                                <span className="text-sm font-medium">{generationStatus.generatedContent.seoScore}/100</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Content Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                                <p className="text-2xl font-bold">{generationStatus.generatedContent.content.split(' ').length}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Reading Time</p>
                                <p className="text-2xl font-bold">{generationStatus.generatedContent.readingTime} min</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Generated Images */}
                      {generationStatus.generatedContent.images && generationStatus.generatedContent.images.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Image className="h-5 w-5" />
                              Generated Images
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {generationStatus.generatedContent.images.map((image, index) => (
                                <div key={index} className="space-y-2">
                                  <img
                                    src={image.url}
                                    alt={image.altText}
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">{image.caption}</p>
                                    <p className="text-xs text-muted-foreground">Alt text: {image.altText}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Content Generated Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate content in the previous tab to see the preview here.
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Switch to generate tab
                        const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                        generateTab?.click();
                      }}>
                        Go to Generator
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Publish to Blog
                  </CardTitle>
                  <CardDescription>
                    Publish your AI-generated content directly to your blog with SEO optimization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generationStatus.generatedContent ? (
                    <div className="space-y-6">
                      {/* Publishing Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Publication Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Category</label>
                              <Select defaultValue={form.getValues('categoryId')?.toString()}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Publication Status</label>
                              <Select defaultValue={form.getValues('autoPublish') ? 'published' : 'draft'}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Save as Draft</SelectItem>
                                  <SelectItem value="published">Publish Immediately</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Content Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Title</p>
                              <p className="text-sm">{generationStatus.generatedContent.title}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                              <p className="text-sm">{generationStatus.generatedContent.content.split(' ').length} words</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">SEO Score</p>
                              <div className="flex items-center gap-2">
                                <Progress value={generationStatus.generatedContent.seoScore} className="flex-1" />
                                <span className="text-sm">{generationStatus.generatedContent.seoScore}/100</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Publish Button */}
                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          onClick={handlePublishContent}
                          disabled={publishToBlogMutation.isPending}
                          className="px-8"
                        >
                          {publishToBlogMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Publish to Blog
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Content Ready for Publishing</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate and review content before publishing to your blog.
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Switch to generate tab
                        const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                        generateTab?.click();
                      }}>
                        Start Creating Content
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}