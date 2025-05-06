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
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts', { category: activeCategory, search: searchQuery }],
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
      <section className="bg-gradient-to-r from-primary-700 to-primary-500 dark:from-primary-900 dark:to-primary-700 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="heading-xl mb-4">Gaming Blog</h1>
            <p className="text-lg mb-6">
              The latest news, reviews, and insights from the gaming world.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search blog posts..." 
                  className="w-full py-3 px-4 pl-12 rounded-lg text-foreground bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
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
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="heading-md mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-muted-foreground mb-6">
              Get the latest gaming news and updates delivered directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 py-3 px-4 rounded-lg border border-border focus:ring-2 focus:ring-primary"
                required
              />
              <button 
                type="submit"
                className="btn-primary py-3 px-6"
              >
                Subscribe
              </button>
            </form>
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
