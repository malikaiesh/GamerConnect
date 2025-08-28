import { GoogleIndexingService } from './google-indexing-service';
import { db } from '../../db';
import { indexingSettings, games, blogPosts, staticPages, gameCategories } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class AutoIndexingService {
  private googleIndexingService: GoogleIndexingService;
  
  constructor() {
    this.googleIndexingService = new GoogleIndexingService();
  }

  private async isAutoIndexingEnabled(): Promise<boolean> {
    try {
      const [settings] = await db.select().from(indexingSettings).limit(1);
      return settings?.autoIndexing || false;
    } catch (error) {
      console.error('Error checking auto-indexing settings:', error);
      return false;
    }
  }

  private getBaseUrl(): string {
    // In production, you might want to get this from environment variables or site settings
    const domain = process.env.REPLIT_DOMAINS || process.env.DOMAIN || 'localhost:5000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${domain}`;
  }

  /**
   * Automatically submit a game URL for indexing when created/updated
   */
  async handleGameIndexing(gameId: number, action: 'created' | 'updated' | 'deleted', userId?: number): Promise<void> {
    try {
      const autoIndexingEnabled = await this.isAutoIndexingEnabled();
      if (!autoIndexingEnabled) return;

      // Get game details
      const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
      if (!game) return;

      const baseUrl = this.getBaseUrl();
      const gameUrl = `${baseUrl}/game/${game.slug}`;

      if (action === 'deleted') {
        // Submit deletion request
        await this.googleIndexingService.deleteUrl(gameUrl, gameId, userId);
        console.log(`Auto-submitted game deletion for indexing: ${gameUrl}`);
      } else {
        // Submit for indexing/re-indexing
        await this.googleIndexingService.submitUrl(gameUrl, 'game', gameId, userId);
        console.log(`Auto-submitted game for indexing: ${gameUrl} (${action})`);
      }
    } catch (error) {
      console.error('Error in auto game indexing:', error);
    }
  }

  /**
   * Automatically submit a blog post URL for indexing when created/updated
   */
  async handleBlogPostIndexing(blogPostId: number, action: 'created' | 'updated' | 'deleted', userId?: number): Promise<void> {
    try {
      const autoIndexingEnabled = await this.isAutoIndexingEnabled();
      if (!autoIndexingEnabled) return;

      // Get blog post details
      const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, blogPostId)).limit(1);
      if (!blogPost) return;

      // Only index published posts
      if (blogPost.status !== 'published' && action !== 'deleted') return;

      const baseUrl = this.getBaseUrl();
      const blogUrl = `${baseUrl}/blog/${blogPost.slug}`;

      if (action === 'deleted') {
        // Submit deletion request
        await this.googleIndexingService.deleteUrl(blogUrl, blogPostId, userId);
        console.log(`Auto-submitted blog post deletion for indexing: ${blogUrl}`);
      } else {
        // Submit for indexing/re-indexing
        await this.googleIndexingService.submitUrl(blogUrl, 'blog_post', blogPostId, userId);
        console.log(`Auto-submitted blog post for indexing: ${blogUrl} (${action})`);
      }
    } catch (error) {
      console.error('Error in auto blog post indexing:', error);
    }
  }

  /**
   * Automatically submit a static page URL for indexing when created/updated
   */
  async handleStaticPageIndexing(pageId: number, action: 'created' | 'updated' | 'deleted', userId?: number): Promise<void> {
    try {
      const autoIndexingEnabled = await this.isAutoIndexingEnabled();
      if (!autoIndexingEnabled) return;

      // Get page details
      const [page] = await db.select().from(staticPages).where(eq(staticPages.id, pageId)).limit(1);
      if (!page) return;

      const baseUrl = this.getBaseUrl();
      const pageUrl = `${baseUrl}/${page.slug}`;

      if (action === 'deleted') {
        // Submit deletion request
        await this.googleIndexingService.deleteUrl(pageUrl, pageId, userId);
        console.log(`Auto-submitted page deletion for indexing: ${pageUrl}`);
      } else {
        // Submit for indexing/re-indexing
        await this.googleIndexingService.submitUrl(pageUrl, 'page', pageId, userId);
        console.log(`Auto-submitted page for indexing: ${pageUrl} (${action})`);
      }
    } catch (error) {
      console.error('Error in auto page indexing:', error);
    }
  }

  /**
   * Automatically submit a category URL for indexing when created/updated
   */
  async handleCategoryIndexing(categoryId: number, action: 'created' | 'updated' | 'deleted', userId?: number): Promise<void> {
    try {
      const autoIndexingEnabled = await this.isAutoIndexingEnabled();
      if (!autoIndexingEnabled) return;

      // Get category details
      const [category] = await db.select().from(gameCategories).where(eq(gameCategories.id, categoryId)).limit(1);
      if (!category) return;

      const baseUrl = this.getBaseUrl();
      const categoryUrl = `${baseUrl}/category/${category.slug}`;

      if (action === 'deleted') {
        // Submit deletion request
        await this.googleIndexingService.deleteUrl(categoryUrl, categoryId, userId);
        console.log(`Auto-submitted category deletion for indexing: ${categoryUrl}`);
      } else {
        // Submit for indexing/re-indexing
        await this.googleIndexingService.submitUrl(categoryUrl, 'category', categoryId, userId);
        console.log(`Auto-submitted category for indexing: ${categoryUrl} (${action})`);
      }
    } catch (error) {
      console.error('Error in auto category indexing:', error);
    }
  }

  /**
   * Bulk submit all existing content for initial indexing setup
   */
  async indexAllExistingContent(userId?: number): Promise<{
    total: number;
    submitted: number;
    failed: number;
    results: Array<{type: string, id: number, url: string, success: boolean, message: string}>
  }> {
    const results = [];
    let submitted = 0;
    let failed = 0;

    try {
      const baseUrl = this.getBaseUrl();

      // Index all games
      const gameList = await db.select().from(games);
      for (const game of gameList) {
        const gameUrl = `${baseUrl}/game/${game.slug}`;
        try {
          const result = await this.googleIndexingService.submitUrl(gameUrl, 'game', game.id, userId);
          results.push({
            type: 'game',
            id: game.id,
            url: gameUrl,
            success: result.success,
            message: result.message
          });
          if (result.success) submitted++; else failed++;
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          results.push({
            type: 'game',
            id: game.id,
            url: gameUrl,
            success: false,
            message: error.message
          });
          failed++;
        }
      }

      // Index all published blog posts
      const blogList = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published'));
      for (const blogPost of blogList) {
        const blogUrl = `${baseUrl}/blog/${blogPost.slug}`;
        try {
          const result = await this.googleIndexingService.submitUrl(blogUrl, 'blog_post', blogPost.id, userId);
          results.push({
            type: 'blog_post',
            id: blogPost.id,
            url: blogUrl,
            success: result.success,
            message: result.message
          });
          if (result.success) submitted++; else failed++;
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          results.push({
            type: 'blog_post',
            id: blogPost.id,
            url: blogUrl,
            success: false,
            message: error.message
          });
          failed++;
        }
      }

      // Index all static pages
      const pageList = await db.select().from(staticPages);
      for (const page of pageList) {
        const pageUrl = `${baseUrl}/${page.slug}`;
        try {
          const result = await this.googleIndexingService.submitUrl(pageUrl, 'page', page.id, userId);
          results.push({
            type: 'page',
            id: page.id,
            url: pageUrl,
            success: result.success,
            message: result.message
          });
          if (result.success) submitted++; else failed++;
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          results.push({
            type: 'page',
            id: page.id,
            url: pageUrl,
            success: false,
            message: error.message
          });
          failed++;
        }
      }

      // Index all categories
      const categoryList = await db.select().from(gameCategories);
      for (const category of categoryList) {
        const categoryUrl = `${baseUrl}/category/${category.slug}`;
        try {
          const result = await this.googleIndexingService.submitUrl(categoryUrl, 'category', category.id, userId);
          results.push({
            type: 'category',
            id: category.id,
            url: categoryUrl,
            success: result.success,
            message: result.message
          });
          if (result.success) submitted++; else failed++;
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          results.push({
            type: 'category',
            id: category.id,
            url: categoryUrl,
            success: false,
            message: error.message
          });
          failed++;
        }
      }

      return {
        total: results.length,
        submitted,
        failed,
        results
      };

    } catch (error) {
      console.error('Error in bulk content indexing:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const autoIndexingService = new AutoIndexingService();