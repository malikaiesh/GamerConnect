import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BlogList } from '@/components/blog/blog-list';
import { BlogPost, BlogCategory } from '@shared/schema';
import { PushNotification } from '@/components/push-notification';
import { PushNotification as PushNotificationType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMorePosts, setShowMorePosts] = useState(false);
  const [activeNotification, setActiveNotification] = useState<PushNotificationType | null>(null);
  
  // Fetch blog categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });
  
  // Fetch blog posts based on active category and search query
  const { data, isLoading } = useQuery<{ posts: BlogPost[], totalPosts: number, totalPages: number }>({
    queryKey: ['/api/blog/posts', { category: activeCategory, search: searchQuery }],
  });
  
  // Extract posts array from the response
  const posts = data?.posts || [];
  
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
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already using search query state, just prevent form submission
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Blog Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-primary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-secondary/30 rounded-full bg-secondary/10 text-secondary text-sm font-medium tracking-wide">
              LATEST ARTICLES
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-foreground font-extrabold">
              Gaming Blog
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed mb-6">
              The latest news, reviews, and insights from the gaming world.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search blog posts..." 
                  className="w-full py-3 px-4 pl-12 rounded-full text-foreground bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg shadow-secondary/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 group-hover:border-secondary/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary/70 group-hover:text-secondary transition-colors duration-300"></i>
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary/10 hover:bg-secondary/20 text-secondary px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      {/* Category Filters */}
      <div className="bg-muted/30 sticky top-16 md:top-20 z-30 shadow-md">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto whitespace-nowrap py-4 scrollbar-hide">
            <div className="flex space-x-2 md:space-x-4">
              <button 
                onClick={() => setActiveCategory('all')}
                className={activeCategory === 'all' ? 'category-pill-active' : 'category-pill'}
              >
                All Posts
              </button>
              
              {categories.map((category) => (
                <button 
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={activeCategory === category.slug ? 'category-pill-active' : 'category-pill'}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Blog Posts */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <BlogList 
            posts={showMorePosts ? posts : posts.slice(0, 6)} 
            loading={isLoading}
            columns={3}
            showLoadMore={posts.length > 6 && !showMorePosts}
            onLoadMore={() => setShowMorePosts(true)}
            hasMorePosts={posts.length > 6 && !showMorePosts}
          />
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-background/90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-secondary blur-3xl"></div>
          <div className="absolute top-10 right-20 w-60 h-60 rounded-full bg-primary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 shadow-xl">
            <div className="text-center">
              <div className="inline-block mb-4 px-4 py-1 border border-secondary/30 rounded-full bg-secondary/10 text-secondary text-sm font-medium tracking-wide">
                STAY UPDATED
              </div>
              <h2 className="heading-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary font-extrabold">Subscribe to Our Newsletter</h2>
              <p className="text-foreground/80 mb-8 max-w-lg mx-auto">
                Get the latest gaming news, exclusive offers, and updates delivered directly to your inbox.
              </p>
              
              <form className="group flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full h-12 pl-4 pr-12 rounded-full border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all duration-300"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/70">
                    <i className="ri-mail-line"></i>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="h-12 px-6 rounded-full font-medium bg-gradient-to-r from-secondary to-primary text-white shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all duration-300 hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="mt-4 text-xs text-foreground/60">
                By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
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
