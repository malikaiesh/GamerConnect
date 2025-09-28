import { useQuery } from '@tanstack/react-query';
import { GameGrid } from '@/components/games/game-grid';
import { Game } from '@shared/schema';
import { fetcher } from '@/lib/queryClient';
import { useState } from 'react';

interface RelatedGamesProps {
  gameId: number;
  category?: string;
  tags?: string[];
  isModal?: boolean;
  onGameSelect?: (game: Game) => void;
}

export function RelatedGames({ 
  gameId, 
  category, 
  tags, 
  isModal = false,
  onGameSelect 
}: RelatedGamesProps) {
  const [displayLimit, setDisplayLimit] = useState(isModal ? 4 : 12);
  
  const { data: relatedGames = [], isLoading } = useQuery({
    queryKey: ['/api/games/related', { gameId, category, tags }],
    queryFn: () => 
      fetcher(`/api/games/related?gameId=${gameId}${category ? `&category=${category}` : ''}${tags ? `&tags=${tags.join(',')}` : ''}`),
  });
  
  if (relatedGames.length === 0 && !isLoading) {
    return null;
  }
  
  // Limit the number of displayed games
  const displayedGames = (relatedGames as Game[]).slice(0, displayLimit);
  const hasMoreGames = relatedGames.length > displayLimit;
  
  const handleShowMore = () => {
    setDisplayLimit(prev => Math.min(prev + 8, relatedGames.length));
  };
  
  const handleGameClick = (game: Game) => {
    if (onGameSelect) {
      onGameSelect(game);
    }
  };
  
  return (
    <div className={`${isModal ? '' : 'mt-6 lg:mt-8'} relative`}>
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className={`${isModal ? 'text-lg sm:text-xl' : 'text-xl lg:text-2xl'} font-bold`}>
          {isModal ? 'You might also like' : 'Related Games'}
        </h2>
        {isModal && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Based on your current game
          </div>
        )}
      </div>
      
      {!isModal && (
        <div className="absolute -top-2 right-0 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hidden sm:block">
          Similar to what you're playing
        </div>
      )}
      
      {/* Mobile-Optimized Container */}
      <div className={`${isModal ? 'bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-xl border border-border/30 backdrop-blur-sm' : ''}`}>
        <GameGrid 
          games={displayedGames} 
          loading={isLoading}
          columns={isModal ? 2 : 4}
          cardSize={isModal ? "md" : "sm"}
          onGameClick={handleGameClick}
          className={isModal ? 'gap-3 sm:gap-4' : 'gap-4'}
        />
        
        {hasMoreGames && !isModal && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleShowMore} 
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl touch-manipulation"
            >
              <i className="ri-add-line mr-2 text-lg"></i>
              <span>Show More Related Games</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
