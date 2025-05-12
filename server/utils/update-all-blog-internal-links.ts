import { db } from "../../db";
import { blogPosts } from "@shared/schema";
import { eq } from "drizzle-orm";
import { processInternalLinks } from "./internal-linking";

/**
 * Updates all published blog posts with internal links
 * This function is meant to be called manually when needed (e.g., on demand by an admin)
 */
export async function updateAllBlogPostsWithInternalLinks(): Promise<{ 
  updated: number, 
  skipped: number, 
  total: number,
  errors: number 
}> {
  const stats = {
    updated: 0,
    skipped: 0,
    total: 0,
    errors: 0
  };
  
  try {
    // Get all published blog posts
    const publishedPosts = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published'));
    stats.total = publishedPosts.length;
    
    // Process each post
    for (const post of publishedPosts) {
      try {
        // Skip posts without content
        if (!post.content || post.content.trim() === '') {
          stats.skipped++;
          console.log(`Skipped post ID ${post.id}: No content`);
          continue;
        }
        
        // Add internal links to the post content
        const updatedContent = await processInternalLinks(post.content, post.id, post.title);
        
        // Skip update if content didn't change
        if (updatedContent === post.content) {
          stats.skipped++;
          console.log(`Skipped post ID ${post.id}: No changes`);
          continue;
        }
        
        // Update the post with new content
        await db.update(blogPosts)
          .set({ 
            content: updatedContent,
            updatedAt: new Date()
          })
          .where(eq(blogPosts.id, post.id));
        
        stats.updated++;
        console.log(`Updated post ID ${post.id}: Added internal links`);
      } catch (error) {
        stats.errors++;
        console.error(`Error updating post ID ${post.id}:`, error);
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error in updateAllBlogPostsWithInternalLinks:', error);
    throw error;
  }
}