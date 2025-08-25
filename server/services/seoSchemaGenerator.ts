import { storage } from "../storage";
import type { SeoSchema, InsertSeoSchema, Game, BlogPost, StaticPage, GameCategory } from "@shared/schema";

interface SeoConfig {
  baseUrl: string;
  siteName: string;
  organizationName: string;
  organizationLogo: string;
  organizationSameAs: string[];
}

export class SeoSchemaGenerator {
  private config: SeoConfig;

  constructor(config: SeoConfig) {
    this.config = config;
  }

  // Generate VideoGame schema for game pages
  async generateGameSchema(game: Game): Promise<Record<string, any>> {
    const gameUrl = `${this.config.baseUrl}/games/${game.slug}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": game.title,
      "description": game.description,
      "url": gameUrl,
      "image": game.thumbnail,
      "genre": game.tags,
      "gamePlatform": ["Web Browser"],
      "applicationCategory": "Game",
      "operatingSystem": "Any",
      "author": {
        "@type": "Organization",
        "name": this.config.organizationName,
        "url": this.config.baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": this.config.organizationName,
        "url": this.config.baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": this.config.organizationLogo
        }
      },
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/PlayAction",
        "userInteractionCount": game.plays
      },
      "aggregateRating": game.ratingCount > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": (game.rating / game.ratingCount).toFixed(1),
        "ratingCount": game.ratingCount,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "datePublished": game.createdAt,
      "dateModified": game.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": gameUrl
      }
    };
  }

  // Generate BlogPosting schema for blog articles
  async generateBlogPostSchema(post: BlogPost): Promise<Record<string, any>> {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt || post.content.substring(0, 160),
      "image": post.featuredImage || `${this.config.baseUrl}/og-image.jpg`,
      "author": {
        "@type": "Person",
        "name": "Gaming Editor", // You can enhance this with actual author data
        "url": this.config.baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": this.config.organizationName,
        "logo": {
          "@type": "ImageObject",
          "url": this.config.organizationLogo
        }
      },
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      },
      "url": postUrl,
      "wordCount": this.countWords(post.content),
      "articleSection": "Gaming",
      "keywords": post.tags?.join(", ") || "",
      "inLanguage": "en-US"
    };
  }

  // Generate CollectionPage schema for game categories
  async generateCategorySchema(category: GameCategory): Promise<Record<string, any>> {
    const categoryUrl = `${this.config.baseUrl}/games/category/${category.slug}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category.name} Games`,
      "description": category.description || `Play the best ${category.name.toLowerCase()} games online for free.`,
      "url": categoryUrl,
      "mainEntity": {
        "@type": "ItemList",
        "name": `${category.name} Games Collection`,
        "description": `A curated collection of ${category.name.toLowerCase()} games`
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": this.config.baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Games",
            "item": `${this.config.baseUrl}/games`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": categoryUrl
          }
        ]
      }
    };
  }

  // Generate WebPage schema for static pages
  async generatePageSchema(page: StaticPage): Promise<Record<string, any>> {
    const pageUrl = `${this.config.baseUrl}/${page.slug}`;
    
    let schemaType = "WebPage";
    if (page.type === "about") schemaType = "AboutPage";
    if (page.type === "contact") schemaType = "ContactPage";
    if (page.type === "faq") schemaType = "FAQPage";

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": page.title,
      "description": page.metaDescription || page.content.substring(0, 160),
      "url": pageUrl,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": this.config.siteName,
        "url": this.config.baseUrl
      },
      "datePublished": page.createdAt,
      "dateModified": page.updatedAt
    };

    // Add FAQ-specific schema
    if (page.type === "faq") {
      const faqData = this.extractFAQFromContent(page.content);
      if (faqData.length > 0) {
        (baseSchema as any).mainEntity = faqData;
      }
    }

    return baseSchema;
  }

  // Generate Organization schema for the website
  async generateOrganizationSchema(): Promise<Record<string, any>> {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": this.config.organizationName,
      "url": this.config.baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": this.config.organizationLogo
      },
      "sameAs": this.config.organizationSameAs,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": `${this.config.baseUrl}/contact`
      }
    };
  }

  // Generate comprehensive schema for a content item
  async generateSchema(
    contentType: 'game' | 'blog_post' | 'page' | 'category' | 'organization',
    contentId?: number,
    customData?: any
  ): Promise<Record<string, any>> {
    switch (contentType) {
      case 'game':
        if (!contentId) throw new Error('Content ID required for game schema');
        const game = await storage.getGameById(contentId);
        if (!game) throw new Error('Game not found');
        return this.generateGameSchema(game);

      case 'blog_post':
        if (!contentId) throw new Error('Content ID required for blog post schema');
        const post = await storage.getBlogPostById(contentId);
        if (!post) throw new Error('Blog post not found');
        return this.generateBlogPostSchema(post);

      case 'category':
        if (!contentId) throw new Error('Content ID required for category schema');
        const category = await storage.getCategoryById(contentId);
        if (!category) throw new Error('Category not found');
        return this.generateCategorySchema(category);

      case 'page':
        if (!contentId) throw new Error('Content ID required for page schema');
        const page = await storage.getStaticPageById(contentId);
        if (!page) throw new Error('Page not found');
        return this.generatePageSchema(page);

      case 'organization':
        return this.generateOrganizationSchema();

      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  // Save generated schema to database
  async saveSchema(
    schemaType: string,
    contentType: 'game' | 'blog_post' | 'page' | 'category' | 'organization' | 'global',
    contentId: number | null,
    schemaData: Record<string, any>,
    name: string,
    userId: number,
    isAutoGenerated: boolean = true
  ): Promise<SeoSchema> {
    const schemaRecord: InsertSeoSchema = {
      schemaType: schemaType as any,
      contentType,
      contentId,
      name,
      schemaData,
      isActive: true,
      isAutoGenerated,
      createdBy: userId,
      priority: 0
    };

    return storage.createSeoSchema(schemaRecord);
  }

  // Auto-generate and save schema for content
  async autoGenerateAndSave(
    contentType: 'game' | 'blog_post' | 'page' | 'category',
    contentId: number,
    userId: number
  ): Promise<SeoSchema> {
    const schemaData = await this.generateSchema(contentType, contentId);
    
    let schemaType: string;
    let name: string;

    switch (contentType) {
      case 'game':
        schemaType = 'VideoGame';
        const game = await storage.getGameById(contentId);
        name = `${game?.title} - Game Schema`;
        break;
      case 'blog_post':
        schemaType = 'BlogPosting';
        const post = await storage.getBlogPostById(contentId);
        name = `${post?.title} - Article Schema`;
        break;
      case 'category':
        schemaType = 'CollectionPage';
        const category = await storage.getCategoryById(contentId);
        name = `${category?.name} - Category Schema`;
        break;
      case 'page':
        schemaType = 'WebPage';
        const page = await storage.getStaticPageById(contentId);
        name = `${page?.title} - Page Schema`;
        break;
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    return this.saveSchema(schemaType, contentType, contentId, schemaData, name, userId, true);
  }

  // Utility: Count words in content
  private countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  // Utility: Extract FAQ data from content (basic implementation)
  private extractFAQFromContent(content: string): any[] {
    const faqRegex = /<h[3-6][^>]*>(.*?)<\/h[3-6]>\s*<p[^>]*>(.*?)<\/p>/gi;
    const faqs: any[] = [];
    let match;

    while ((match = faqRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        faqs.push({
          "@type": "Question",
          "name": match[1].replace(/<[^>]*>/g, '').trim(),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": match[2].replace(/<[^>]*>/g, '').trim()
          }
        });
      }
    }

    return faqs;
  }
}

// Factory function to create schema generator with site settings
export async function createSeoSchemaGenerator(): Promise<SeoSchemaGenerator> {
  const settings = await storage.getSettings();
  
  const config: SeoConfig = {
    baseUrl: process.env.SITE_URL || 'https://gamezone.com',
    siteName: settings.siteTitle || 'GameZone',
    organizationName: settings.siteTitle || 'GameZone',
    organizationLogo: `${process.env.SITE_URL || 'https://gamezone.com'}/logo.png`,
    organizationSameAs: [
      // Add your social media URLs here
      'https://twitter.com/gamezone',
      'https://facebook.com/gamezone'
    ]
  };

  return new SeoSchemaGenerator(config);
}