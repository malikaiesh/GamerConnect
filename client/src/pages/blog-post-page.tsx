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
  
  // Process the content HTML to insert ads at specific paragraph positions
  const processedContent = useMemo(() => {
    if (!post?.content) {
      return '';
    }
    
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    
    // Find all paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    
    if (paragraphs.length <= 2) {
      // If there are 2 or fewer paragraphs, don't insert paragraph ads
      return post.content;
    }
    
    // Insert ad markers after specific paragraphs
    const adPositions = [
      { index: 2, type: 'paragraph2' },
      { index: 4, type: 'paragraph4' },
      { index: 6, type: 'paragraph6' },
      { index: 8, type: 'paragraph8' }
    ];
    
    // Insert markers from the bottom up to avoid index shifting
    adPositions
      .filter(pos => pos.index < paragraphs.length) // Only process valid positions
      .sort((a, b) => b.index - a.index) // Sort in descending order
      .forEach(({ index, type }) => {
        const paragraph = paragraphs[index];
        if (paragraph) {
          const marker = document.createElement('div');
          marker.setAttribute('data-ad-position', type);
          paragraph.after(marker);
        }
      });
    
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
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* Render post content with ad markers */}
                <div 
                  className="blog-content-with-ads"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                  ref={(element) => {
                    // After rendering, we need to find and replace the ad markers
                    if (element) {
                      // Find all ad position markers
                      const adMarkers = element.querySelectorAll('[data-ad-position]');
                      
                      // Replace each marker with the actual ad component
                      adMarkers.forEach(marker => {
                        const position = marker.getAttribute('data-ad-position');
                        if (position) {
                          // Create a wrapper div for the ad that matches content flow
                          const adWrapper = document.createElement('div');
                          adWrapper.className = 'ad-wrapper my-6 w-full block';
                          adWrapper.style.maxWidth = '100%';
                          adWrapper.style.margin = '1.5rem 0';
                          
                          // Create a placeholder that React can fill later
                          const adPlaceholder = document.createElement('div');
                          adPlaceholder.className = 'ad-placeholder';
                          adPlaceholder.setAttribute('data-ad-type', position);
                          adPlaceholder.style.textAlign = 'left';
                          
                          // Add the placeholder to the wrapper
                          adWrapper.appendChild(adPlaceholder);
                          
                          // Replace the marker with our wrapper
                          marker.parentNode?.replaceChild(adWrapper, marker);
                        }
                      });
                      
                      // Now find all placeholders and render ads into them
                      element.querySelectorAll('.ad-placeholder').forEach(placeholder => {
                        const adType = placeholder.getAttribute('data-ad-type') as 'paragraph2' | 'paragraph4' | 'paragraph6' | 'paragraph8';
                        if (adType) {
                          // Create an ad element
                          const adElement = document.createElement('div');
                          adElement.className = 'blog-ad-container';
                          placeholder.appendChild(adElement);
                          
                          // Render the ad content directly for better performance
                          if (settings?.[`${adType}Ad` as keyof SiteSetting]) {
                            const adContent = settings[`${adType}Ad` as keyof SiteSetting] as string;
                            if (adContent && adContent.trim()) {
                              // Create a styled container for the ad
                              const adContainer = document.createElement('div');
                              adContainer.className = 'blog-ad-container';
                              adContainer.style.width = '100%';
                              adContainer.style.textAlign = 'left';
                              adContainer.style.margin = '0';
                              
                              // Add the ad content
                              adContainer.innerHTML = adContent;
                              adElement.appendChild(adContainer);
                            }
                          }
                        }
                      });
                    }
                  }}
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
