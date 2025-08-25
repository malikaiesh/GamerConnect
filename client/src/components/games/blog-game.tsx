import { useQuery } from '@tanstack/react-query';
import { Game, SiteSetting } from '@shared/schema';
import { Star, Play, Gamepad2 } from 'lucide-react';

interface BlogGameProps {
  type: 'paragraph2' | 'paragraph4' | 'paragraph6' | 'paragraph8' | 'paragraph10';
  className?: string;
}

export function BlogGame({ type, className = '' }: BlogGameProps) {
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

  // Select a game based on position to provide variety
  const gameIndex = {
    paragraph2: 0,
    paragraph4: 1,
    paragraph6: 2,
    paragraph8: 3,
    paragraph10: 4,
  }[type];

  const selectedGame = games[gameIndex % games.length];

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
    <div className={`w-full my-6 blog-game-container ${className}`}>
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6 rounded-xl border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-purple-300">Featured Game</h3>
        </div>
        
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/50">
          <div className="flex gap-4">
            {/* Game Thumbnail */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <img 
                src={selectedGame.thumbnail} 
                alt={selectedGame.title} 
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              {selectedGame.status === 'featured' && (
                <span className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                  FEATURED
                </span>
              )}
            </div>
            
            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground mb-1 truncate">{selectedGame.title}</h4>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1">{averageRating.toFixed(1)}</span>
              </div>
              
              {/* Category and Plays */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded">
                  {selectedGame.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedGame.plays.toLocaleString()} plays
                </span>
              </div>
              
              {/* Play Now Button */}
              <button
                onClick={openGame}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Play className="w-4 h-4 fill-white" />
                Play Now
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <a 
            href="/games" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium underline decoration-purple-400/30 hover:decoration-purple-300 transition-colors"
          >
            Browse more games →
          </a>
        </div>
      </div>
    </div>
  );
}