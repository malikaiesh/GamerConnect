import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GameFilters } from '@/components/games/game-filters';
import { GameGrid } from '@/components/games/game-grid';
import { BlogList } from '@/components/blog/blog-list';
import { Rating } from '@/components/ui/rating';
import { PushNotification } from '@/components/push-notification';
import { HomepageContent } from '@/components/home/homepage-content';
import { Game, BlogPost, PushNotification as PushNotificationType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMoreFeatured, setShowMoreFeatured] = useState(false);
  const [showMorePopular, setShowMorePopular] = useState(false);
  const [activeNotification, setActiveNotification] = useState<PushNotificationType | null>(null);
  
  // Fetch featured games
  const { data: featuredGames = [], isLoading: loadingFeatured } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch popular games based on active category
  const { data: popularGames = [], isLoading: loadingPopular } = useQuery<Game[]>({
    queryKey: ['/api/games/popular', { category: activeCategory }],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch blog posts
  const { data: blogPosts = [], isLoading: loadingBlog } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/recent'],
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
  
  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
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
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="heading-xl mb-4">Play the Best Free Online Games</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Discover thousands of free games across all genres. No downloads required - play instantly in your browser!
              </p>
              <div className="flex space-x-4">
                <Link href="#games" className="btn-secondary">
                  Play Now
                </Link>
                <Link href="#categories" className="bg-white/20 hover:bg-white/30 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors backdrop-blur-sm">
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img src="https://images.unsplash.com/photo-1588495752527-77d65c21f7cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" alt="Gaming controller with colorful game elements" className="rounded-xl shadow-2xl" />
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground text-lg font-bold py-2 px-4 rounded-lg shadow-lg transform rotate-3">
                New Games Daily!
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Filters */}
      <GameFilters 
        onFilter={handleCategoryChange} 
        activeCategory={activeCategory}
      />
      
      {/* Featured Games Section */}
      <section id="featured" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-md">Featured Games</h2>
            <Link href="/featured" className="text-primary hover:underline flex items-center">
              View All <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          
          <GameGrid 
            games={showMoreFeatured ? featuredGames : featuredGames.slice(0, 4)} 
            loading={loadingFeatured}
            columns={4}
            showLoadMore={featuredGames.length > 4 && !showMoreFeatured}
            onLoadMore={() => setShowMoreFeatured(true)}
            hasMoreGames={featuredGames.length > 4 && !showMoreFeatured}
          />
        </div>
      </section>
      
      {/* Random Game Banner */}
      <section className="py-8 bg-primary-50 dark:bg-primary-900/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="heading-md mb-3">Feeling Lucky?</h2>
              <p className="text-muted-foreground mb-4">
                Discover a new game with our random game picker. You might find your next favorite!
              </p>
              <Link 
                href="/random-game" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center"
              >
                <i className="ri-dice-line mr-2 text-xl"></i> Random Game
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
              {/* Random game thumbnails */}
              {featuredGames.slice(0, 4).map((game, index) => (
                <div key={index} className="bg-muted rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={game.thumbnail} 
                    alt={game.title} 
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Games Section */}
      <section id="games" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-md">Popular Games</h2>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-sm hidden md:inline">Sort by:</span>
              <select className="bg-card text-foreground rounded border border-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>
          
          <GameGrid 
            games={showMorePopular ? popularGames : popularGames.slice(0, 10)} 
            loading={loadingPopular}
            columns={5}
            cardSize="sm"
            showLoadMore={popularGames.length > 10 && !showMorePopular}
            onLoadMore={() => setShowMorePopular(true)}
            hasMoreGames={popularGames.length > 10 && !showMorePopular}
          />
        </div>
      </section>
      
      {/* Blog Section */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-md">Latest Gaming News</h2>
            <Link href="/blog" className="text-primary hover:underline flex items-center">
              Visit Blog <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          
          <BlogList 
            posts={blogPosts.slice(0, 3)} 
            loading={loadingBlog}
            columns={3}
          />
        </div>
      </section>
      
      {/* Homepage Content Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="heading-md text-center">About GameZone</h2>
          </div>
          <HomepageContent />
        </div>
      </section>
      
      {/* App Download Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="heading-lg mb-4">Take GameZone With You Anywhere</h2>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Download our mobile app and play your favorite games on the go. Available on iOS, Android, and Amazon devices.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="flex items-center bg-background text-foreground hover:bg-muted px-5 py-3 rounded-lg transition-colors">
                  <i className="ri-app-store-fill text-3xl mr-3"></i>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="flex items-center bg-background text-foreground hover:bg-muted px-5 py-3 rounded-lg transition-colors">
                  <i className="ri-google-play-fill text-3xl mr-3"></i>
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </a>
                <a href="#" className="flex items-center bg-background text-foreground hover:bg-muted px-5 py-3 rounded-lg transition-colors">
                  <i className="ri-amazon-fill text-3xl mr-3"></i>
                  <div>
                    <div className="text-xs">Available at</div>
                    <div className="text-lg font-semibold">Amazon</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600&q=80" 
                alt="GameZone mobile app on smartphone" 
                className="max-w-xs md:max-w-sm rounded-3xl shadow-2xl transform -rotate-6"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
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
