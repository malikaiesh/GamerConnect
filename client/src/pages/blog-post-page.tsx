import { useState, useEffect, useMemo } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BlogList } from '@/components/blog/blog-list';
import { SocialShare } from '@/components/shared/social-share';
import { SocialShareButtons } from '@/components/shared/social-share-buttons';
import { BlogPost, PushNotification as PushNotificationType, SiteSetting } from '@shared/schema';
import { PushNotification } from '@/components/push-notification';
import { BlogAd } from '@/components/ads/blog-ad';
import { BlogGame } from '@/components/games/blog-game';
import { MarkdownRenderer } from '@/components/blog/markdown-renderer';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Enhanced Blog Content component that integrates games within content with individual paragraph controls
function EnhancedBlogContent({ content, settings, className }: { 
  content: string; 
  settings: SiteSetting | undefined; 
  className: string;
}) {
  // Convert content to HTML if it's markdown
  const getHtmlContent = (content: string) => {
    // Check if content looks like markdown (contains markdown syntax)
    const hasMarkdownSyntax = /(\*\*|\*|#|\[|\]|\n-|\n\d+\.)/.test(content);
    
    if (hasMarkdownSyntax) {
      // Configure marked for better rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      
      // Convert markdown to HTML and sanitize
      const htmlContent = marked(content, { async: false }) as string;
      return DOMPurify.sanitize(htmlContent);
    }
    
    // Return content as-is if it's already HTML
    return content;
  };

  const htmlContent = getHtmlContent(content);

  if (!settings?.blogGamesEnabled) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  // Parse content and inject games at strategic positions
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = Array.from(doc.body.children);
  
  let currentSection = 0;
  let paragraphsInSection = 0;
  let gameIndex = 1;
  
  const result: (JSX.Element | string)[] = [];
  
  elements.forEach((element, index) => {
    // Add the current element
    const elementHtml = element.outerHTML;
    result.push(<div key={`content-${index}`} dangerouslySetInnerHTML={{ __html: elementHtml }} />);
    
    // Check if this is a heading
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
      currentSection++;
      paragraphsInSection = 0;
    }
    
    // If it's a paragraph, count it and potentially add a game
    if (element.tagName === 'P') {
      paragraphsInSection++;
      
      // Add game after specific paragraph counts in each section based on individual controls
      // Simplified logic: add games more frequently to ensure they appear
      const shouldAddGame = 
        (currentSection >= 1 && paragraphsInSection === 2 && settings.paragraph2GamesEnabled) || // After 2 paragraphs in any section
        (currentSection >= 2 && paragraphsInSection === 4 && settings.paragraph6GamesEnabled) || // After 4 paragraphs in later sections  
        (currentSection >= 3 && paragraphsInSection === 6 && settings.paragraph8GamesEnabled) || // After 6 paragraphs in later sections
        (currentSection >= 1 && paragraphsInSection === 3 && settings.paragraph10GamesEnabled);   // After 3 paragraphs in any section
      
      if (shouldAddGame && gameIndex <= 5) {
        result.push(
          <BlogGame 
            key={`game-${gameIndex}`} 
            type={`section${currentSection}-game${gameIndex}`} 
            gameIndex={gameIndex} 
          />
        );
        gameIndex++;
      }
    }
  });
  
  return <div className={className}>{result}</div>;
}
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

export default function BlogPostPage() {
  const [match, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';
  const [activeNotification, setActiveNotification] = useState<PushNotificationType | null>(null);
  
  // Fetch blog post data
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/by-slug/${slug}`],
    enabled: !!slug,
  });
  
  // Fetch related posts
  const { data: relatedPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts/related', post?.categoryId, post?.id],
    queryFn: () => 
      post ? fetch(`/api/blog/posts/related?categoryId=${post.categoryId}&excludeId=${post.id}`).then(res => res.json()) : [],
    enabled: !!post?.id,
  });

  // Fetch site settings for ads
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });
  
  // Fetch active push notifications
  const { data: notifications = [] } = useQuery<PushNotificationType[]>({
    queryKey: ['/api/notifications/active'],
  });
  
  // Effect to show push notification after a short delay
  useEffect(() => {
    if (notifications && notifications.length > 0 && !activeNotification) {
      // Select a random notification
      const randomIndex = Math.floor(Math.random() * notifications.length);
      
      const timer = setTimeout(() => {
        setActiveNotification(notifications[randomIndex]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);
  
  // Format date for display
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  // Track notification impression
  const trackNotificationImpression = async (notificationId: number) => {
    try {
      await apiRequest('POST', `/api/notifications/${notificationId}/impression`, {});
    } catch (error) {
      console.error('Error tracking notification impression:', error);
    }
  };
  
  // Track notification click
  const trackNotificationClick = async (notificationId: number) => {
    try {
      await apiRequest('POST', `/api/notifications/${notificationId}/click`, {});
    } catch (error) {
      console.error('Error tracking notification click:', error);
    }
  };
  
  // Effect to track notification impression
  useEffect(() => {
    if (activeNotification) {
      trackNotificationImpression(activeNotification.id);
    }
  }, [activeNotification]);
  
  // Process the content HTML to insert games at strategic positions within heading sections
  const processedContent = useMemo(() => {
    if (!post?.content) {
      return '';
    }
    
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    
    // Find all headings and paragraphs
    const allElements = Array.from(tempDiv.children);
    const headings = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    
    let currentHeadingSection = 0;
    let paragraphsInSection = 0;
    let gameIndex = 1;
    
    // Process each element and identify heading sections
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      
      // If we encounter a heading, start a new section
      if (headings.includes(element.tagName)) {
        currentHeadingSection++;
        paragraphsInSection = 0;
        continue;
      }
      
      // If it's a paragraph, count it within the current section
      if (element.tagName === 'P') {
        paragraphsInSection++;
        
        // Calculate target paragraph position for this heading section
        // First section: after 2 paragraphs, Second: after 4, Third: after 6, etc.
        const targetParagraph = currentHeadingSection === 0 ? 2 : (currentHeadingSection * 2);
        
        // Insert game marker if we've reached the target paragraph in this section
        if (paragraphsInSection === targetParagraph && gameIndex <= 5) {
          const gameMarker = document.createElement('div');
          gameMarker.setAttribute('data-game-position', `section${currentHeadingSection}-game${gameIndex}`);
          gameMarker.setAttribute('data-game-index', gameIndex.toString());
          element.after(gameMarker);
          gameIndex++;
        }
      }
    }
    
    // If no headings found, use simple paragraph-based insertion (fallback)
    if (currentHeadingSection === 0) {
      const paragraphs = tempDiv.querySelectorAll('p');
      if (paragraphs.length > 2) {
        const positions = [2, 5, 8, 11, 14]; // Spread games more throughout content
        positions.forEach((pos, index) => {
          if (pos < paragraphs.length) {
            const gameMarker = document.createElement('div');
            gameMarker.setAttribute('data-game-position', `fallback-game${index + 1}`);
            gameMarker.setAttribute('data-game-index', (index + 1).toString());
            paragraphs[pos].after(gameMarker);
          }
        });
      }
    }
    
    return tempDiv.innerHTML;
  }, [post?.content]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the blog post you were looking for. It may have been removed or the link is incorrect.
            </p>
            <a href="/blog" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors">
              Return to Blog
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Featured Image Header */}
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
            <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
              <div className="max-w-4xl">
                {post.categoryId && (
                  <span className="inline-block bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded mb-4">
                    {post.category?.name || ''}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{post.title}</h1>
                <div className="flex items-center text-white">
                  <div className="flex items-center mr-6">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden mr-3">
                      <img 
                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}`} 
                        alt={post.author} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{post.author}</span>
                  </div>
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Content */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <article className="lg:w-2/3">
              {/* Header Ad */}
              <BlogAd type="header" className="mb-6" />
              
              <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-foreground">
                {/* Render post content with enhanced visibility */}
                <EnhancedBlogContent 
                  content={post.content} 
                  settings={settings} 
                  className="blog-content-with-ads text-foreground"
                />
              </div>
              
              
              {/* After Content Ad */}
              <BlogAd type="afterContent" className="my-6" />
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Author Bio */}
              <div className="mt-10 pt-6 border-t border-border">
                <div className="flex items-start">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden mr-4">
                    <img 
                      src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}`} 
                      alt={post.author} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{post.author}</h3>
                    <p className="text-muted-foreground">
                      Content author and gaming enthusiast. Passionate about bringing the latest gaming news and insights to our readers.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Inline Share Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">Enjoyed this article? Share it:</h3>
                  <SocialShareButtons
                    title={post.title}
                    description={post.excerpt}
                    url={window.location.href}
                    image={post.featuredImage}
                    platforms={['facebook', 'twitter', 'linkedin', 'email']}
                    size="sm"
                    compact={true}
                  />
                </div>
              </div>
            </article>
            
            {/* Sidebar */}
            <aside className="lg:w-1/3">
              {/* Related Posts */}
              <div className="sticky top-24">
                {/* Sidebar Ad */}
                <BlogAd type="sidebar" className="mb-8" />
                
                <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                <div className="space-y-6">
                  {relatedPosts.length > 0 ? (
                    relatedPosts.map(relatedPost => (
                      <a 
                        key={relatedPost.id} 
                        href={`/blog/${relatedPost.slug}`} 
                        className="flex items-start group"
                      >
                        <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={relatedPost.featuredImage} 
                            alt={relatedPost.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                          </span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No related articles found.</p>
                  )}
                </div>
                
                {/* Second Sidebar Ad */}
                <div className="my-8">
                  <BlogAd type="sidebar" />
                </div>
                
                {/* Share Buttons */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-xl font-bold mb-4">Share This Post</h3>
                  <div className="space-y-4">
                    <SocialShareButtons
                      title={post.title}
                      description={post.excerpt}
                      url={window.location.href}
                      image={post.featuredImage}
                      platforms={['facebook', 'twitter', 'linkedin', 'email', 'copy']}
                    />
                    
                    <div className="flex justify-center mt-3">
                      <SocialShare
                        title={post.title}
                        description={post.excerpt}
                        url={window.location.href}
                        image={post.featuredImage}
                        variant="outline"
                        size="sm"
                      >
                        More sharing options
                      </SocialShare>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        
        {/* More Blog Posts */}
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-6">More Gaming Articles</h2>
            
            <BlogList 
              posts={relatedPosts.length > 3 ? relatedPosts : []} 
              loading={false}
              columns={3}
            />
          </div>
        </section>
        
        {/* Footer Ad */}
        <div className="container mx-auto px-4 py-8">
          <BlogAd type="footer" />
        </div>
      </main>
      
      <Footer />
      
      {/* Push Notification */}
      {activeNotification && (
        <PushNotification 
          notification={activeNotification}
          onClose={() => setActiveNotification(null)}
          onAction={() => {
            if (activeNotification.id) {
              trackNotificationClick(activeNotification.id);
            }
            if (activeNotification.link) {
              window.location.href = activeNotification.link;
            }
          }}
        />
      )}
    </div>
  );
}
