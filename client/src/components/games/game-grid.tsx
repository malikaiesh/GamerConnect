import { useState, useEffect } from 'react';
import { GameCard } from '@/components/games/game-card';
import { Game } from '@shared/schema';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  columns?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  hasMoreGames?: boolean;
  cardSize?: 'sm' | 'md' | 'lg';
  className?: string;
  showRank?: boolean;
  rankOffset?: number;
}

export function GameGrid({
  games,
  loading = false,
  columns = 4,
  showLoadMore = false,
  onLoadMore,
  hasMoreGames = false,
  cardSize = 'md',
  className = '',
  showRank = false,
  rankOffset = 0
}: GameGridProps) {
  const [gridCols, setGridCols] = useState(getColumnClass(columns));
  
  // Adjust grid columns based on current window size
  useEffect(() => {
    function handleResize() {
      setGridCols(getColumnClass(columns));
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);
  
  // Helper function to determine column class based on screen size
  function getColumnClass(maxColumns: number) {
    const baseClass = 'grid gap-4 md:gap-6';
    
    switch (maxColumns) {
      case 2:
        return `${baseClass} grid-cols-1 sm:grid-cols-2`;
      case 3:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case 4:
        return `${baseClass} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`;
      case 5:
        return `${baseClass} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`;
      default:
        return `${baseClass} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`;
    }
  }
  
  if (loading) {
    return (
      <div className={gridCols + ' ' + className}>
        {Array(columns).fill(0).map((_, index) => (
          <div key={index} className="game-card bg-card rounded-xl shadow-lg overflow-hidden opacity-50 animate-pulse">
            <div className="w-full h-40 bg-muted"></div>
            <div className="p-4">
              <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-4 w-24 bg-muted rounded mb-3"></div>
              <div className="h-4 w-full bg-primary/50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-bold mb-2">No Games Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or check back later for new games.</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className={gridCols}>
        {games.map((game, index) => (
          <GameCard 
            key={game.id} 
            game={game} 
            size={cardSize}
            rank={showRank ? index + 1 + rankOffset : undefined}
          />
        ))}
      </div>
      
      {showLoadMore && hasMoreGames && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onLoadMore}
            className="bg-card border border-border text-foreground px-6 py-2 rounded-lg hover:bg-muted transition-colors shadow-md flex items-center"
          >
            Load More Games <i className="ri-arrow-down-line ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
}
