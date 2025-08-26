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
    <div className={`${isModal ? '' : 'mt-8'} relative`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`${isModal ? 'text-xl' : 'heading-md'} font-bold`}>
          {isModal ? 'You might also like' : 'Related Games'}
        </h2>
        {isModal && (
          <div className="text-sm text-muted-foreground">
            Based on your current game
          </div>
        )}
      </div>
      
      {!isModal && (
        <div className="absolute -top-2 right-0 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          Similar to what you're playing
        </div>
      )}
      
      <div className={`${isModal ? 'bg-card/50 p-4 rounded-lg border border-border/50' : ''}`}>
        <GameGrid 
          games={displayedGames} 
          loading={isLoading}
          columns={isModal ? 2 : 4}
          cardSize={isModal ? "md" : "sm"}
          onGameClick={handleGameClick}
          className={isModal ? 'gap-4' : ''}
        />
        
        {hasMoreGames && !isModal && (
          <div className="mt-4 flex justify-center">
            <button 
              onClick={handleShowMore} 
              className="btn-outline"
            >
              <i className="ri-add-line mr-1"></i> Show More Related Games
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
