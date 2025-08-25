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
    <div className={`w-full my-8 blog-game-container ${className}`}>
      {/* Attractive game section with gradient background and enhanced design */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 rounded-2xl shadow-2xl">
        <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          {/* Header with animated icon */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎮 Take a Gaming Break!
              </h3>
              <p className="text-sm text-muted-foreground">Try this amazing featured game</p>
            </div>
          </div>
          
          {/* Enhanced game card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
            <div className="flex gap-5">
              {/* Enhanced Game Thumbnail */}
              <div className="relative w-28 h-28 flex-shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-opacity"></div>
                <img 
                  src={selectedGame.thumbnail} 
                  alt={selectedGame.title} 
                  className="relative w-full h-full object-cover rounded-xl border-2 border-white/20 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {selectedGame.status === 'featured' && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
              
              {/* Enhanced Game Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-foreground mb-2 truncate">{selectedGame.title}</h4>
                
                {/* Enhanced Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({selectedGame.ratingCount} reviews)</span>
                </div>
                
                {/* Enhanced Category and Plays */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm px-3 py-1 rounded-full font-medium">
                    {selectedGame.category}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    🎯 {selectedGame.plays.toLocaleString()} plays
                  </span>
                </div>
                
                {/* Enhanced Play Now Button */}
                <button
                  onClick={openGame}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span className="text-lg">Play Now - Free!</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Browse link */}
          <div className="text-center mt-6">
            <a 
              href="/games" 
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-semibold underline decoration-purple-600/30 hover:decoration-purple-600 transition-colors"
            >
              <span>🎮 Discover more amazing games</span>
              <span className="text-lg">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}