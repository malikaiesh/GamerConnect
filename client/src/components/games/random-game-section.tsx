import { useQuery } from '@tanstack/react-query';
import { Game } from '@shared/schema';
import { GameCard } from '@/components/games/game-card';
import { RandomGameButton } from '@/components/home/random-game-button';
import { Dices, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RandomGameSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch a random game with caching disabled
  const { data: randomGame, isLoading, isError } = useQuery<Game>({
    queryKey: ['/api/games/random', refreshKey],
    staleTime: 0,
    gcTime: 0,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <section className="py-12 bg-accent/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="heading-lg flex items-center">
              <Dices className="mr-2 h-8 w-8" />
              Random Game Discovery
            </h2>
            <p className="text-muted-foreground">Find your next favorite game with our random game picker</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <RandomGameButton size="md" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-pulse flex items-center gap-2">
              <Dices className="h-6 w-6 text-primary animate-spin" />
              <span>Finding a random game...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <p className="text-destructive mb-4">Failed to load a random game</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : randomGame ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <GameCard game={randomGame} size="lg" showRating showCategory showPlays />
            </div>
            <div className="mt-6">
              <p className="text-center mb-4 text-muted-foreground">
                Not interested in this game? Try another one!
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Random Game
                </button>
                <RandomGameButton size="md" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <p className="text-muted-foreground mb-4">No games found</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}