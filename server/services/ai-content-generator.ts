import OpenAI from 'openai';
import { storage } from '../storage';

// Content generation interfaces
export interface ContentGenerationRequest {
  title: string;
  topic: string;
  aiModel: 'chatgpt' | 'claude' | 'google_gemini';
  contentType: 'blog_post' | 'article' | 'tutorial' | 'review' | 'news' | 'guide';
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'technical';
  wordCount: number;
  targetAudience: string;
  keywords: string;
  metaDescription: string;
  generateImages: boolean;
  includeConclusion: boolean;
  includeFAQ: boolean;
}

export interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  images?: Array<{
    url: string;
    altText: string;
    caption: string;
  }>;
  readingTime: number;
  seoScore: number;
}

export interface AIModelConfig {
  type: string;
  apiKey: string;
  isActive: boolean;
  name: string;
}

class AIContentGenerator {
  private openai?: OpenAI;

  async initializeAIModels(): Promise<{ [key: string]: AIModelConfig }> {
    const apiKeys = await storage.getApiKeys();
    const aiModels: { [key: string]: AIModelConfig } = {};

    for (const key of apiKeys) {
      if (['chatgpt', 'claude', 'google_gemini'].includes(key.type) && key.isActive && key.value) {
        aiModels[key.type] = {
          type: key.type,
          apiKey: key.value,
          isActive: key.isActive,
          name: key.name
        };

        // Initialize OpenAI if ChatGPT is available
        if (key.type === 'chatgpt') {
          this.openai = new OpenAI({
            apiKey: key.value
          });
        }
      }
    }

    return aiModels;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const models = await this.initializeAIModels();
    
    if (!models[request.aiModel]) {
      throw new Error(`AI model ${request.aiModel} is not configured or inactive`);
    }

    let generatedContent: GeneratedContent;

    switch (request.aiModel) {
      case 'chatgpt':
        generatedContent = await this.generateWithChatGPT(request);
        break;
      case 'claude':
        generatedContent = await this.generateWithClaude(request);
        break;
      case 'google_gemini':
        generatedContent = await this.generateWithGemini(request);
        break;
      default:
        throw new Error(`Unsupported AI model: ${request.aiModel}`);
    }

    // Calculate SEO score
    generatedContent.seoScore = this.calculateSEOScore(generatedContent, request);
    
    // Calculate reading time
    generatedContent.readingTime = this.calculateReadingTime(generatedContent.content);

    return generatedContent;
  }

  private async generateWithChatGPT(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildContentPrompt(request);
    
    try {
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert content writer and SEO specialist. Create high-quality, engaging content that is optimized for search engines and provides real value to readers. Always format your response as valid HTML with proper structure."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: Math.min(request.wordCount * 2, 4000),
      });

      const content = response.choices[0].message.content || '';
      
      // Extract title and content from the generated text
      const { title, htmlContent } = this.parseGeneratedContent(content, request.title);
      
      // Generate keywords from content
      const keywords = await this.extractKeywords(htmlContent, request.keywords);
      
      let images: Array<{ url: string; altText: string; caption: string }> = [];
      
      // Generate images if requested
      if (request.generateImages) {
        images = await this.generateContentImages(request.title, request.topic);
      }

      return {
        title,
        content: htmlContent,
        metaDescription: request.metaDescription,
        keywords,
        images,
        readingTime: 0, // Will be calculated later
        seoScore: 0 // Will be calculated later
      };
    } catch (error) {
      console.error('ChatGPT content generation error:', error);
      throw new Error(`ChatGPT generation failed: ${error.message}`);
    }
  }

  private async generateWithClaude(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // Claude implementation would go here
    // For now, we'll throw an error indicating it's not implemented
    throw new Error('Claude integration not yet implemented. Please configure ChatGPT or Google Gemini.');
  }

  private async generateWithGemini(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // Google Gemini implementation would go here
    // For now, we'll throw an error indicating it's not implemented
    throw new Error('Google Gemini integration not yet implemented. Please configure ChatGPT.');
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    const {
      title,
      topic,
      contentType,
      tone,
      wordCount,
      targetAudience,
      keywords,
      includeConclusion,
      includeFAQ
    } = request;

    const keywordList = keywords.split(',').map(k => k.trim()).join(', ');

    let prompt = `Write a ${contentType} with the following specifications:

TITLE: "${title}"

TOPIC: ${topic}

REQUIREMENTS:
- Target word count: ${wordCount} words
- Writing tone: ${tone}
- Target audience: ${targetAudience}
- SEO keywords to include naturally: ${keywordList}
- Content type: ${contentType}

STRUCTURE REQUIREMENTS:
- Start with an engaging introduction that hooks the reader
- Use clear headings (H2, H3) to organize content
- Include bullet points or numbered lists where appropriate
- Write in a ${tone} tone suitable for ${targetAudience}
- Naturally incorporate the keywords: ${keywordList}
`;

    // Add content type specific instructions
    switch (contentType) {
      case 'review':
        prompt += `
- Include pros and cons sections
- Provide a rating or recommendation
- Compare with alternatives if relevant`;
        break;
      case 'tutorial':
        prompt += `
- Include step-by-step instructions
- Add tips and warnings where appropriate
- Include troubleshooting section`;
        break;
      case 'guide':
        prompt += `
- Structure as a comprehensive guide
- Include prerequisites or requirements
- Add actionable steps and examples`;
        break;
      case 'news':
        prompt += `
- Start with the most important information
- Include relevant background context
- End with implications or next steps`;
        break;
    }

    if (includeConclusion) {
      prompt += `
- End with a compelling conclusion that summarizes key points`;
    }

    if (includeFAQ) {
      prompt += `
- Include a FAQ section with 3-5 relevant questions and answers`;
    }

    prompt += `

FORMAT: Return the content in clean HTML format with proper heading tags (h2, h3), paragraph tags, and list tags. Do not include the title in the content - it will be added separately.

IMPORTANT: 
- Make the content genuinely helpful and informative
- Use natural language that flows well
- Include relevant examples and practical insights
- Ensure the content is original and engaging
- Optimize for both readers and search engines`;

    return prompt;
  }

  private parseGeneratedContent(rawContent: string, originalTitle: string): { title: string; htmlContent: string } {
    // Clean up the content and extract title if generated
    const lines = rawContent.split('\n').filter(line => line.trim() !== '');
    
    let title = originalTitle;
    let contentStart = 0;

    // Check if the first line looks like a title
    if (lines[0] && !lines[0].includes('<') && lines[0].length < 150) {
      // Remove common title prefixes
      const potentialTitle = lines[0]
        .replace(/^(Title:|TITLE:|#\s*)/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();
      
      if (potentialTitle.length > 10 && potentialTitle.length < 150) {
        title = potentialTitle;
        contentStart = 1;
      }
    }

    // Join the remaining content
    let htmlContent = lines.slice(contentStart).join('\n');

    // Basic HTML cleanup and formatting
    htmlContent = this.formatContentAsHTML(htmlContent);

    return { title, htmlContent };
  }

  private formatContentAsHTML(content: string): string {
    // Convert markdown-style formatting to HTML if needed
    let html = content;

    // Convert headers
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');

    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Convert lists
    html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)\n(<li>.*<\/li>)/g, '$1\n$2');
    html = html.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/g, '<ul>$1</ul>');

    // Convert paragraphs
    const paragraphs = html.split('\n\n');
    html = paragraphs
      .map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<ul>') || p.startsWith('<ol>') || p.startsWith('<li>')) {
          return p;
        }
        return `<p>${p}</p>`;
      })
      .filter(p => p)
      .join('\n\n');

    return html;
  }

  private async extractKeywords(content: string, originalKeywords: string): Promise<string[]> {
    // Start with original keywords
    const keywords = originalKeywords.split(',').map(k => k.trim()).filter(k => k);
    
    // Simple keyword extraction from content
    const text = content.replace(/<[^>]*>/g, ' ').toLowerCase();
    const words = text.split(/\s+/);
    const wordFreq: { [key: string]: number } = {};

    // Count word frequency
    words.forEach(word => {
      word = word.replace(/[^\w]/g, '');
      if (word.length > 3 && !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top words
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Combine and deduplicate
    const allKeywords = [...keywords, ...topWords];
    return [...new Set(allKeywords)].slice(0, 10);
  }

  private async generateContentImages(title: string, topic: string): Promise<Array<{ url: string; altText: string; caption: string }>> {
    if (!this.openai) {
      return [];
    }

    try {
      // Generate relevant image prompts
      const imagePrompts = [
        `Professional illustration for "${title}" - clean, modern style suitable for blog header`,
        `Conceptual image representing ${topic} - minimalist design with relevant visual elements`
      ];

      const images: Array<{ url: string; altText: string; caption: string }> = [];

      for (const prompt of imagePrompts) {
        try {
          const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          });

          if (response.data[0]?.url) {
            const altText = await this.generateImageAltText(prompt, title, topic);
            images.push({
              url: response.data[0].url,
              altText,
              caption: `Illustration for ${title}`
            });
          }
        } catch (imageError) {
          console.error('Image generation error:', imageError);
          // Continue with other images if one fails
        }
      }

      return images;
    } catch (error) {
      console.error('Image generation failed:', error);
      return [];
    }
  }

  private async generateImageAltText(imagePrompt: string, title: string, topic: string): Promise<string> {
    if (!this.openai) {
      return `Image related to ${title}`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Generate SEO-optimized alt text for images. Keep it descriptive but concise, under 125 characters, and include relevant keywords naturally."
          },
          {
            role: "user",
            content: `Generate alt text for an image with this description: "${imagePrompt}" related to the article titled "${title}" about ${topic}`
          }
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      return response.choices[0].message.content?.trim() || `Image related to ${title}`;
    } catch (error) {
      console.error('Alt text generation error:', error);
      return `Image related to ${title}`;
    }
  }

  private calculateSEOScore(content: GeneratedContent, request: ContentGenerationRequest): number {
    let score = 0;
    const maxScore = 100;

    // Title length (10 points)
    if (content.title.length >= 30 && content.title.length <= 60) {
      score += 10;
    } else if (content.title.length >= 20 && content.title.length <= 80) {
      score += 7;
    } else {
      score += 3;
    }

    // Meta description length (10 points)
    if (content.metaDescription.length >= 120 && content.metaDescription.length <= 160) {
      score += 10;
    } else if (content.metaDescription.length >= 100 && content.metaDescription.length <= 180) {
      score += 7;
    } else {
      score += 3;
    }

    // Keyword presence in title (15 points)
    const titleLower = content.title.toLowerCase();
    const keywords = request.keywords.split(',').map(k => k.trim().toLowerCase());
    const keywordsInTitle = keywords.filter(keyword => titleLower.includes(keyword));
    score += Math.min(15, (keywordsInTitle.length / keywords.length) * 15);

    // Keyword presence in content (20 points)
    const contentLower = content.content.toLowerCase();
    const keywordsInContent = keywords.filter(keyword => contentLower.includes(keyword));
    score += Math.min(20, (keywordsInContent.length / keywords.length) * 20);

    // Content length (15 points)
    const wordCount = content.content.split(' ').length;
    if (wordCount >= request.wordCount * 0.9 && wordCount <= request.wordCount * 1.1) {
      score += 15;
    } else if (wordCount >= request.wordCount * 0.7 && wordCount <= request.wordCount * 1.3) {
      score += 10;
    } else {
      score += 5;
    }

    // Structure (headings) (10 points)
    const headingMatches = content.content.match(/<h[2-6]>/g);
    if (headingMatches && headingMatches.length >= 2) {
      score += 10;
    } else if (headingMatches && headingMatches.length >= 1) {
      score += 5;
    }

    // Images with alt text (10 points)
    if (content.images && content.images.length > 0) {
      score += 10;
    }

    // Reading time appropriate (10 points)
    if (content.readingTime >= 2 && content.readingTime <= 10) {
      score += 10;
    } else if (content.readingTime >= 1 && content.readingTime <= 15) {
      score += 5;
    }

    return Math.min(maxScore, Math.round(score));
  }

  private calculateReadingTime(content: string): number {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    // Average reading speed is 200-300 words per minute, we'll use 250
    const readingTimeMinutes = wordCount / 250;
    
    return Math.max(1, Math.round(readingTimeMinutes));
  }
}

export const aiContentGenerator = new AIContentGenerator();