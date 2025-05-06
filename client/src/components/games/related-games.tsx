import { useQuery } from '@tanstack/react-query';
import { GameGrid } from '@/components/games/game-grid';
import { Game } from '@shared/schema';
import { fetcher } from '@/lib/queryClient';

interface RelatedGamesProps {
  gameId: number;
  category?: string;
  tags?: string[];
}

export function RelatedGames({ gameId, category, tags }: RelatedGamesProps) {
  const { data: relatedGames = [], isLoading } = useQuery({
    queryKey: ['/api/games/related', { gameId, category, tags }],
    queryFn: () => 
      fetcher(`/api/games/related?gameId=${gameId}${category ? `&category=${category}` : ''}${tags ? `&tags=${tags.join(',')}` : ''}`),
  });
  
  if (relatedGames.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h2 className="heading-md mb-4">Related Games</h2>
      <GameGrid 
        games={relatedGames as Game[]} 
        loading={isLoading}
        columns={4}
        cardSize="sm"
      />
    </div>
  );
}
