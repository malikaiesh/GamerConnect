import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GameFilters } from '@/components/games/game-filters';
import { GameGrid } from '@/components/games/game-grid';
import { BlogList } from '@/components/blog/blog-list';
import { TeamSection } from '@/components/team-section';
import { Rating } from '@/components/ui/rating';
import { PushNotification } from '@/components/push-notification';
import { HomepageContent } from '@/components/home/homepage-content';
import { RandomGameButton } from '@/components/home/random-game-button';
import { RandomGameSection } from '@/components/games/random-game-section';
import { HomeAd } from '@/components/ads/home-ad';
import { HeroSlider } from '@/components/HeroSlider';
import { Game, BlogPost, PushNotification as PushNotificationType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMoreFeatured, setShowMoreFeatured] = useState(false);
  const [allPopularGames, setAllPopularGames] = useState<Game[]>([]);
  const [popularGamesPage, setPopularGamesPage] = useState(1);
  const [popularGamesLimit] = useState(15); // Show 15 games per page
  const [hasMorePopularGames, setHasMorePopularGames] = useState(true);
  const [activeNotification, setActiveNotification] = useState<PushNotificationType | null>(null);
  
  // Fetch featured games
  const { data: featuredGames = [], isLoading: loadingFeatured } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
  });
  
  // Fetch popular games based on active category and pagination
  const { data: popularGamesPage1Data, isLoading: loadingPopular } = useQuery<{ games: Game[], pagination: { hasMore: boolean, total: number } }>({
    queryKey: ['/api/games/popular', { category: activeCategory, page: 1, limit: popularGamesLimit }],
  });
  
  // Extract games and pagination data from the response
  const popularGamesPage1 = popularGamesPage1Data?.games || [];
  
  // Fetch additional pages of popular games
  const { data: additionalPopularGamesData, isLoading: loadingMorePopular } = useQuery<{ games: Game[], pagination: { hasMore: boolean, total: number } }>({
    queryKey: ['/api/games/popular', { category: activeCategory, page: popularGamesPage, limit: popularGamesLimit }],
    enabled: popularGamesPage > 1, // Only fetch additional pages when popularGamesPage > 1
  });
  
  // Extract games and pagination data from the response
  const additionalPopularGames = additionalPopularGamesData?.games || [];
  
  // Update allPopularGames when first page is loaded - optimize with memoized updates
  useEffect(() => {
    if (popularGamesPage === 1 && popularGamesPage1Data) {
      setAllPopularGames(popularGamesPage1);
      setHasMorePopularGames(popularGamesPage1Data.pagination.hasMore);
    }
  }, [popularGamesPage1, popularGamesPage1Data, popularGamesPage]);
  
  // Update allPopularGames when additional pages are loaded - optimize with memoized updates
  useEffect(() => {
    if (popularGamesPage > 1 && additionalPopularGamesData && additionalPopularGames.length > 0) {
      setAllPopularGames(prevGames => {
        // Filter out any duplicates by ID - optimized with Set for faster lookups
        const existingIds = new Set(prevGames.map(game => game.id));
        const newGames = additionalPopularGames.filter(game => !existingIds.has(game.id));
        return [...prevGames, ...newGames];
      });
      
      setHasMorePopularGames(additionalPopularGamesData.pagination.hasMore);
    }
  }, [additionalPopularGames, additionalPopularGamesData, popularGamesPage]);
  
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
    setPopularGamesPage(1); // Reset to page 1 when changing categories
    setHasMorePopularGames(true); // Reset hasMorePopularGames when changing categories
    setAllPopularGames([]); // Clear all loaded games when changing categories
  };
  
  // Track notification impression
  const trackNotificationImpression = async (notificationId: number) => {
    try {
      await apiRequest('POST', `/api/notifications/${notificationId}/impression`, {});
    } catch (error) {
      console.error('Error tracking notification impression:', error);
    }
  };
  
  // Handle loading more popular games
  const handleLoadMorePopular = () => {
    setPopularGamesPage(prevPage => prevPage + 1);
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden" style={{
        background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="heading-xl mb-4 text-white">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Play the Best</span> 
                Gaming Experience
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Discover thousands of immersive games across all genres. No downloads required - play instantly in your browser!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/games" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                  Play Now
                </Link>
                <Link href="/categories" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                  Browse Categories
                </Link>
                <RandomGameButton 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                />
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <HeroSlider />
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Filters */}
      <GameFilters 
        onFilter={handleCategoryChange} 
        activeCategory={activeCategory}
      />
      
      {/* Ad Above Featured Games */}
      <HomeAd position="above_featured" />
      
      {/* Featured Games Section */}
      <section id="featured" className="py-10 bg-background">
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
      
      {/* Ad Below Featured Games */}
      <HomeAd position="below_featured" />
      
      {/* Random Game Banner */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="heading-md mb-3">Feeling Lucky?</h2>
              <p className="text-muted-foreground mb-4">
                Discover a new game with our random game picker. You might find your next favorite!
              </p>
              <Link 
                href="/random" 
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
      
      {/* Ad Above Popular Games */}
      <HomeAd position="above_popular" />
      
      {/* Popular Games Section */}
      <section id="games" className="py-10 bg-background">
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
          
          {/* Game Categories Filter */}
          <div className="mb-8">
            <GameFilters onFilter={handleCategoryChange} activeCategory={activeCategory} />
          </div>
          
          {/* Show loading state separately for additional pages */}
          {popularGamesPage > 1 && loadingMorePopular && (
            <div className="flex justify-center my-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <GameGrid 
            games={allPopularGames} 
            loading={popularGamesPage === 1 ? loadingPopular : false}
            columns={5}
            cardSize="sm"
            showLoadMore={true}
            onLoadMore={handleLoadMorePopular}
            hasMoreGames={hasMorePopularGames}
            loadMoreLabel="Load More Games"
          />
        </div>
      </section>
      
      {/* Ad Below Popular Games */}
      <HomeAd position="below_popular" />
      
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
      
      {/* Ad Above About */}
      <HomeAd position="above_about" />
      
      {/* Homepage Content Section */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="heading-md text-center">About GameZone</h2>
          </div>
          <HomepageContent />
        </div>
      </section>
      
      {/* Ad Below About */}
      <HomeAd position="below_about" />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Footer */}
      <Footer />
      
      {/* Push Notification - Disabled for cleaner UI */}
      {/* {activeNotification && (
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
      )} */}
    </div>
  );
}
