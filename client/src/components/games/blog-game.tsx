import { useQuery } from '@tanstack/react-query';
import { Game, SiteSetting } from '@shared/schema';
import { Star, Play, Gamepad2 } from 'lucide-react';

interface BlogGameProps {
  type: 'paragraph2' | 'paragraph4' | 'paragraph6' | 'paragraph8' | 'paragraph10' | string;
  gameIndex?: number;
  className?: string;
}

export function BlogGame({ type, gameIndex = 1, className = '' }: BlogGameProps) {
  // Fetch featured games for blog integration
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
  });

  // Fetch site settings to check if blog games are enabled
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // If games integration is disabled, don't render anything
  if (settings?.blogGamesEnabled === false) {
    return null;
  }

  // If no games available, don't render anything
  if (!games || games.length === 0) {
    return null;
  }

  // Select a game based on the provided gameIndex to provide variety
  const selectedGame = games[(gameIndex - 1) % games.length];

  if (!selectedGame) {
    return null;
  }

  const openGame = () => {
    if (selectedGame.url) {
      window.open(selectedGame.url, '_blank', 'noopener,noreferrer');
    }
  };

  const averageRating = selectedGame.ratingCount > 0 ? (selectedGame.rating / selectedGame.ratingCount) : 0;

  return (
    <div className={`w-full my-6 sm:my-8 blog-game-container ${className}`}>
      {/* Mobile-optimized game section with responsive gradient background */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-xl">
        <div className="bg-background/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/10">
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎮 Take a Gaming Break!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Try this amazing featured game</p>
            </div>
          </div>
          
          {/* Mobile-optimized game card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
            {/* Mobile: Vertical layout, Desktop: Horizontal layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
              {/* Mobile-optimized Game Thumbnail */}
              <div className="relative w-full sm:w-24 md:w-28 h-32 sm:h-24 md:h-28 flex-shrink-0 group mx-auto sm:mx-0 max-w-xs sm:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg sm:rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-opacity"></div>
                <img 
                  src={selectedGame.thumbnail} 
                  alt={selectedGame.title} 
                  className="relative w-full h-full object-cover rounded-lg sm:rounded-xl border-2 border-white/20 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {selectedGame.status === 'featured' && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
              
              {/* Mobile-optimized Game Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-bold text-foreground mb-2 line-clamp-2 sm:truncate">{selectedGame.title}</h4>
                
                {/* Mobile-optimized Rating */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">({selectedGame.ratingCount} reviews)</span>
                </div>
                
                {/* Mobile-optimized Category and Plays */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                    {selectedGame.category}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                    🎯 {selectedGame.plays.toLocaleString()} plays
                  </span>
                </div>
                
                {/* Mobile-optimized Play Now Button */}
                <button
                  onClick={openGame}
                  className="w-full mobile-game-button group"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white flex-shrink-0 group-hover:animate-pulse" />
                  <span className="font-bold">Play Now - Free!</span>
                  <span className="hidden sm:inline ml-1">🚀</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile-optimized Browse link */}
          <div className="text-center mt-4 sm:mt-6">
            <a 
              href="/games" 
              className="inline-flex items-center gap-1 sm:gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs sm:text-sm font-semibold underline decoration-purple-600/30 hover:decoration-purple-600 transition-colors"
            >
              <span>🎮 Discover more amazing games</span>
              <span className="text-sm sm:text-lg">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}