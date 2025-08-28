import { BlogPost } from "@shared/schema";
import { db } from "../../db";
import { blogPosts } from "@shared/schema";
import { eq, and, not, like, desc, or } from "drizzle-orm";

// Number of internal links to add per post
const MAX_INTERNAL_LINKS = 5;

// Keywords to avoid linking (common words)
const IGNORED_KEYWORDS = [
  'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'about',
  'that', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can',
  'may', 'might', 'must', 'shall', 'game', 'games', 'play', 'gaming'
];

// Get title keywords from a blog post
function extractTitleKeywords(title: string): string[] {
  // Convert to lowercase and remove special characters
  const cleanTitle = title.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words and filter out short words (less than 4 characters) and common words
  const words = cleanTitle.split(/\s+/).filter(word => 
    word.length >= 4 && !IGNORED_KEYWORDS.includes(word.toLowerCase())
  );
  
  return [...new Set(words)]; // Remove duplicates
}

// Extracts high-quality keywords from the post content
function extractContentKeywords(content: string): string[] {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ');
  
  // Convert to lowercase and remove special characters
  const cleanText = plainText.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words and filter out short words and common words
  const words = cleanText.split(/\s+/).filter(word => 
    word.length >= 4 && !IGNORED_KEYWORDS.includes(word.toLowerCase())
  );
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency and get top keywords
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);
}

// Find potential posts to link to based on keywords
async function findRelatedPosts(
  currentPostId: number | null,
  keywords: string[],
  limit: number = 10
): Promise<BlogPost[]> {
  if (keywords.length === 0) return [];
  
  // Find posts with titles containing any of the keywords
  const keywordConditions = keywords.map(keyword => 
    like(blogPosts.title, `%${keyword}%`)
  );
  
  // Create the base conditions
  const baseConditions = [
    eq(blogPosts.status, 'published'),
    currentPostId ? not(eq(blogPosts.id, currentPostId)) : undefined
  ].filter(Boolean);
  
  // Combine all conditions: base conditions AND (keyword1 OR keyword2 OR ...)
  const whereCondition = and(
    ...baseConditions,
    or(...keywordConditions)
  );
  
  try {
    return await db.select()
      .from(blogPosts)
      .where(whereCondition)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  } catch (error) {
    console.error('Error finding related posts:', error);
    return [];
  }
}

// Add internal links to the content
function addInternalLinks(content: string, relatedPosts: BlogPost[], currentPostId: number | null): string {
  if (relatedPosts.length === 0) return content;
  
  let modifiedContent = content;
  let linkCount = 0;
  
  // Process each related post
  for (const post of relatedPosts) {
    if (linkCount >= MAX_INTERNAL_LINKS) break;
    
    // Skip if this is the current post
    if (currentPostId && post.id === currentPostId) continue;
    
    // Get keywords from this post's title
    const keywords = extractTitleKeywords(post.title);
    
    // Try to find each keyword in the content and add a link
    for (const keyword of keywords) {
      if (linkCount >= MAX_INTERNAL_LINKS) break;
      
      // Create a regex that matches the keyword as a whole word, case-insensitive
      // Only match if it's not already inside an HTML tag or a link
      const regex = new RegExp(
        `(?<![<"'])\\b(${keyword})\\b(?![^<]*>|[^<]*<\\/a>)`,
        'i'
      );
      
      // Check if keyword exists in the content
      if (regex.test(modifiedContent)) {
        // Create link HTML
        const link = `<a href="/blog/${post.slug}" class="internal-link" title="${post.title}">$1</a>`;
        
        // Replace only the first occurrence
        modifiedContent = modifiedContent.replace(regex, link);
        linkCount++;
        break; // Only add one link per related post
      }
    }
  }
  
  return modifiedContent;
}

// Main function to process content and add internal links
export async function processInternalLinks(
  content: string,
  currentPostId: number | null = null,
  title: string = ""
): Promise<string> {
  try {
    // Extract keywords from the post title and content
    const titleKeywords = title ? extractTitleKeywords(title) : [];
    const contentKeywords = extractContentKeywords(content);
    
    // Combine keywords, prioritizing title keywords
    const combinedKeywords = [...new Set([...titleKeywords, ...contentKeywords])];
    
    // Find related posts based on combined keywords
    const relatedPosts = await findRelatedPosts(currentPostId, combinedKeywords);
    
    // Add internal links to the content
    return addInternalLinks(content, relatedPosts, currentPostId);
  } catch (error) {
    console.error('Error processing internal links:', error);
    // In case of error, return the original content unmodified
    return content;
  }
}