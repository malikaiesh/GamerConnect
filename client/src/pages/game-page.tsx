import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Rating } from '@/components/ui/rating';
import { RelatedGames } from '@/components/games/related-games';
import { PushNotification } from '@/components/push-notification';
import { PostGameModal } from '@/components/games/post-game-modal';
import { SocialShare } from '@/components/shared/social-share';
import { SocialShareButtons } from '@/components/shared/social-share-buttons';
import { Game, PushNotification as PushNotificationType } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function GamePage() {
  const [gameIdPath, idParams] = useRoute('/game/:id');
  const [gameSlugPath, slugParams] = useRoute('/g/:slug');
  
  // Handle both ID and slug-based routes
  const isIdRoute = !!gameIdPath;
  const isSlugRoute = !!gameSlugPath;
  
  // Extract ID or slug based on the route
  const gameId = isIdRoute && idParams?.id ? parseInt(idParams.id) : 0;
  const gameSlug = isSlugRoute && slugParams?.slug ? slugParams.slug : '';
  
  const [userRating, setUserRating] = useState(0);
  const [activeNotification, setActiveNotification] = useState<PushNotificationType | null>(null);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const gamePlayTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Fetch game data based on ID or slug
  const { data: game, isLoading, error } = useQuery<Game>({
    queryKey: isIdRoute ? [`/api/games/${gameId}`] : [`/api/games/slug/${gameSlug}`],
    enabled: !!(isIdRoute ? gameId : gameSlug),
  });
  
  // Fetch active push notifications
  const { data: notifications = [] } = useQuery<PushNotificationType[]>({
    queryKey: ['/api/notifications/active'],
  });
  
  // Mutation for submitting a rating
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!game) return;
      await apiRequest('POST', `/api/games/${game.id}/rate`, { rating });
    },
    onSuccess: () => {
      if (game) {
        // Invalidate both types of queries (id and slug) to ensure data consistency
        queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}`] });
        if (game.slug) {
          queryClient.invalidateQueries({ queryKey: [`/api/games/slug/${game.slug}`] });
        }
        
        toast({
          title: 'Rating Submitted',
          description: 'Thank you for rating this game!',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Rating Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for incrementing play count
  const playMutation = useMutation({
    mutationFn: async () => {
      if (!game) return;
      await apiRequest('POST', `/api/games/${game.id}/play`, {});
    },
  });
  
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
  
  // Increment play count when game loads
  useEffect(() => {
    if (game) {
      playMutation.mutate();
    }
  }, [game]);
  
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
  
  // Effect to track notification impression
  useEffect(() => {
    if (activeNotification) {
      trackNotificationImpression(activeNotification.id);
    }
  }, [activeNotification]);
  
  // Effect to set up game play timer for the post-game modal
  useEffect(() => {
    if (game && game.url) {
      // Show the post-game modal after 2 minutes of gameplay (simulating game completion)
      gamePlayTimer.current = setTimeout(() => {
        setShowPostGameModal(true);
      }, 120000); // 2 minutes (adjust as needed for demonstration)
      
      return () => {
        if (gamePlayTimer.current) {
          clearTimeout(gamePlayTimer.current);
        }
      };
    }
  }, [game]);
  
  // Calculate average rating
  const calculateAverageRating = () => {
    if (!game || game.ratingCount === 0) return 0;
    return game.rating / game.ratingCount;
  };
  
  const handleRating = (rating: number) => {
    setUserRating(rating);
    ratingMutation.mutate(rating);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <h1 className="heading-lg mb-4">Game Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the game you were looking for. It may have been removed or the link is incorrect.
            </p>
            <a href="/" className="btn-primary">
              Return to Home Page
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
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Info Column */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6">
              <img 
                src={game.thumbnail} 
                alt={game.title} 
                className="w-full h-64 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {game.category}
                  </span>
                  <div className="flex items-center">
                    <i className="ri-gamepad-line mr-1 text-muted-foreground"></i>
                    <span className="text-sm text-muted-foreground">{game.plays.toLocaleString()} plays</span>
                  </div>
                </div>
                
                <h1 className="heading-lg mb-2">{game.title}</h1>
                
                <div className="flex items-center mb-6">
                  <Rating 
                    initialRating={calculateAverageRating()} 
                    interactive={false}
                    size="md"
                  />
                  <span className="text-sm text-muted-foreground ml-2">
                    ({calculateAverageRating().toFixed(1)}) from {game.ratingCount} ratings
                  </span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{game.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Rate this game</h3>
                  <div className="flex items-center">
                    <Rating 
                      initialRating={userRating} 
                      onChange={handleRating}
                      size="lg"
                    />
                    {ratingMutation.isPending && (
                      <span className="ml-2 text-sm text-muted-foreground">Submitting...</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Share Game</h3>
                  <SocialShareButtons
                    title={game.title}
                    description={`Play ${game.title} - ${game.description}`}
                    url={window.location.href}
                    image={game.thumbnail}
                    platforms={['facebook', 'twitter', 'linkedin', 'email', 'copy']}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Download Game App</h3>
                  <div className="space-y-3">
                    {game.appStoreUrl && (
                      <a 
                        href={game.appStoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        <i className="ri-app-store-fill text-2xl mr-3"></i>
                        <div>
                          <div className="text-xs">Download on the</div>
                          <div className="text-sm font-semibold">App Store</div>
                        </div>
                      </a>
                    )}
                    
                    {game.playStoreUrl && (
                      <a 
                        href={game.playStoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        <i className="ri-google-play-fill text-2xl mr-3"></i>
                        <div>
                          <div className="text-xs">Get it on</div>
                          <div className="text-sm font-semibold">Google Play</div>
                        </div>
                      </a>
                    )}
                    
                    {game.amazonAppStoreUrl && (
                      <a 
                        href={game.amazonAppStoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        <i className="ri-amazon-fill text-2xl mr-3"></i>
                        <div>
                          <div className="text-xs">Available at</div>
                          <div className="text-sm font-semibold">Amazon</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Frame Column */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="aspect-video w-full">
                {game.url ? (
                  <iframe 
                    src={game.url}
                    title={game.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Game content unavailable</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="btn-outline">
                    <i className="ri-fullscreen-line mr-1"></i> Fullscreen
                  </button>
                  
                  <SocialShare
                    title={game.title}
                    description={`Play ${game.title} - ${game.description}`}
                    url={window.location.href}
                    image={game.thumbnail}
                  />
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => setShowPostGameModal(true)}
                >
                  <i className="ri-restart-line mr-1"></i> Restart Game
                </button>
              </div>
            </div>
            
            {/* Related Games Section */}
            <RelatedGames 
              gameId={game.id} 
              category={game.category}
              tags={game.tags}
            />
          </div>
        </div>
      </div>
      
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
      
      {/* Post-Game Modal */}
      {game && showPostGameModal && (
        <PostGameModal 
          game={game} 
          isOpen={showPostGameModal}
          onClose={() => setShowPostGameModal(false)}
        />
      )}
    </div>
  );
}
