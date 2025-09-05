import { Request, Response } from 'express';
import { z } from 'zod';
import { aiContentGenerator } from '../services/ai-content-generator';
import { storage } from '../storage';

// Request validation schema
const generateContentSchema = z.object({
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

type GenerateContentRequest = z.infer<typeof generateContentSchema>;

// Generate AI content
export async function generateAIContent(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = generateContentSchema.parse(req.body);

    // Check if AI model is configured
    const apiKeys = await storage.getApiKeys();
    const modelKey = apiKeys.find(key => key.type === validatedData.aiModel && key.isActive);
    
    if (!modelKey || !modelKey.value) {
      return res.status(400).json({ 
        error: `${validatedData.aiModel} is not configured or active`,
        message: `Please configure ${validatedData.aiModel} API key in the API Keys section`
      });
    }

    // Generate content using AI service
    const generatedContent = await aiContentGenerator.generateContent({
      title: validatedData.title,
      topic: validatedData.topic,
      aiModel: validatedData.aiModel,
      contentType: validatedData.contentType,
      tone: validatedData.tone,
      wordCount: validatedData.wordCount,
      targetAudience: validatedData.targetAudience,
      keywords: validatedData.keywords,
      metaDescription: validatedData.metaDescription,
      generateImages: validatedData.generateImages,
      includeConclusion: validatedData.includeConclusion,
      includeFAQ: validatedData.includeFAQ,
    });

    // Auto-publish if requested
    if (validatedData.autoPublish) {
      try {
        await storage.createBlogPost({
          title: generatedContent.title,
          slug: generateSlug(generatedContent.title),
          content: generatedContent.content,
          excerpt: generateExcerpt(generatedContent.content),
          featuredImage: generatedContent.images?.[0]?.url || '',
          categoryId: validatedData.categoryId,
          tags: generatedContent.keywords,
          status: 'published',
          author: 'AI Content Generator',
          authorAvatar: '',
          publishedAt: new Date(),
        });
      } catch (publishError) {
        console.error('Auto-publish failed:', publishError);
        // Continue with content generation even if publish fails
      }
    }

    res.json(generatedContent);
  } catch (error) {
    console.error('AI content generation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Content generation failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

// Get available AI models
export async function getAvailableAIModels(req: Request, res: Response) {
  try {
    const apiKeys = await storage.getApiKeys();
    const aiModels = apiKeys
      .filter(key => ['chatgpt', 'claude', 'google_gemini'].includes(key.type) && key.isActive)
      .map(key => ({
        type: key.type,
        name: key.name,
        isActive: key.isActive,
        isConfigured: !!key.value
      }));

    res.json(aiModels);
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({
      error: 'Failed to fetch AI models',
      message: error.message
    });
  }
}

// Test AI model configuration
export async function testAIModel(req: Request, res: Response) {
  try {
    const { modelType } = req.params;
    
    if (!['chatgpt', 'claude', 'google_gemini'].includes(modelType)) {
      return res.status(400).json({
        error: 'Invalid AI model type'
      });
    }

    const apiKeys = await storage.getApiKeys();
    const modelKey = apiKeys.find(key => key.type === modelType && key.isActive);
    
    if (!modelKey || !modelKey.value) {
      return res.status(400).json({
        error: `${modelType} is not configured or active`
      });
    }

    // Test the model with a simple request
    const testRequest = {
      title: 'Test Content Generation',
      topic: 'Testing AI model connectivity and response quality',
      aiModel: modelType as 'chatgpt' | 'claude' | 'google_gemini',
      contentType: 'article' as const,
      tone: 'professional' as const,
      wordCount: 100,
      targetAudience: 'developers',
      keywords: 'test, AI, content',
      metaDescription: 'Test meta description for AI model testing',
      generateImages: false,
      includeConclusion: false,
      includeFAQ: false,
    };

    const result = await aiContentGenerator.generateContent(testRequest);

    res.json({
      success: true,
      model: modelType,
      testResult: {
        contentLength: result.content.length,
        seoScore: result.seoScore,
        readingTime: result.readingTime,
        keywordsFound: result.keywords.length
      }
    });
  } catch (error) {
    console.error('AI model test error:', error);
    res.status(500).json({
      success: false,
      error: 'Model test failed',
      message: error.message
    });
  }
}

// Generate image alt text for existing images
export async function generateImageAltText(req: Request, res: Response) {
  try {
    const { imageUrl, context, title } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        error: 'Image URL is required'
      });
    }

    // Check if ChatGPT (vision model) is available
    const apiKeys = await storage.getApiKeys();
    const chatgptKey = apiKeys.find(key => key.type === 'chatgpt' && key.isActive);
    
    if (!chatgptKey || !chatgptKey.value) {
      return res.status(400).json({
        error: 'ChatGPT is required for image alt text generation'
      });
    }

    // For now, generate alt text based on context
    // In a full implementation, you would analyze the actual image
    const altText = `Image related to ${title || context || 'article content'}`;

    res.json({
      altText,
      imageUrl
    });
  } catch (error) {
    console.error('Image alt text generation error:', error);
    res.status(500).json({
      error: 'Alt text generation failed',
      message: error.message
    });
  }
}

// Utility functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last complete sentence within the limit
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // Otherwise, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Content optimization suggestions
export async function getContentOptimizationSuggestions(req: Request, res: Response) {
  try {
    const { content, title, keywords } = req.body;
    
    if (!content || !title) {
      return res.status(400).json({
        error: 'Content and title are required'
      });
    }

    const suggestions = [];
    const keywordList = keywords?.split(',').map((k: string) => k.trim().toLowerCase()) || [];

    // Check title length
    if (title.length < 30) {
      suggestions.push({
        type: 'title',
        severity: 'warning',
        message: 'Title is too short. Consider expanding it to 30-60 characters for better SEO.'
      });
    } else if (title.length > 60) {
      suggestions.push({
        type: 'title',
        severity: 'warning',
        message: 'Title is too long. Consider shortening it to under 60 characters.'
      });
    }

    // Check keyword presence in title
    const titleLower = title.toLowerCase();
    const keywordsInTitle = keywordList.filter(keyword => titleLower.includes(keyword));
    if (keywordList.length > 0 && keywordsInTitle.length === 0) {
      suggestions.push({
        type: 'keywords',
        severity: 'error',
        message: 'None of your target keywords appear in the title. Consider including at least one.'
      });
    }

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push({
        type: 'content',
        severity: 'warning',
        message: 'Content is quite short. Consider expanding it to at least 300 words for better SEO.'
      });
    }

    // Check for headings
    const headingMatches = content.match(/<h[2-6]>/g);
    if (!headingMatches || headingMatches.length < 2) {
      suggestions.push({
        type: 'structure',
        severity: 'info',
        message: 'Consider adding more headings (H2, H3) to improve content structure and readability.'
      });
    }

    // Check keyword density
    const contentLower = content.toLowerCase();
    keywordList.forEach(keyword => {
      const keywordCount = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;
      
      if (density > 3) {
        suggestions.push({
          type: 'keywords',
          severity: 'warning',
          message: `Keyword "${keyword}" appears too frequently (${density.toFixed(1)}%). Consider reducing usage to avoid keyword stuffing.`
        });
      } else if (density < 0.5 && keywordCount > 0) {
        suggestions.push({
          type: 'keywords',
          severity: 'info',
          message: `Keyword "${keyword}" could be used more frequently for better optimization.`
        });
      }
    });

    res.json({
      suggestions,
      stats: {
        wordCount,
        headingCount: headingMatches?.length || 0,
        keywordDensity: keywordList.map(keyword => ({
          keyword,
          count: (contentLower.match(new RegExp(keyword, 'g')) || []).length,
          density: ((contentLower.match(new RegExp(keyword, 'g')) || []).length / wordCount) * 100
        }))
      }
    });
  } catch (error) {
    console.error('Content optimization analysis error:', error);
    res.status(500).json({
      error: 'Optimization analysis failed',
      message: error.message
    });
  }
}