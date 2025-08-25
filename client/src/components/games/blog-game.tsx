import { useQuery } from '@tanstack/react-query';
import { Game } from '@shared/schema';
import { GameCard } from './game-card';

interface BlogGameProps {
  type: 'paragraph2' | 'paragraph4' | 'paragraph6' | 'paragraph8' | 'paragraph10';
  className?: string;
}

export function BlogGame({ type, className = '' }: BlogGameProps) {
  // Fetch featured games for blog integration
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
  });

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

  return (
    <div className={`w-full my-6 blog-game-container ${className}`}>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-primary mb-1">🎮 Featured Game</h3>
          <p className="text-sm text-muted-foreground">Take a break and try this amazing game!</p>
        </div>
        
        <div className="max-w-sm mx-auto">
          <GameCard 
            game={selectedGame} 
            size="sm"
            showCategory={false}
            showPlays={false}
          />
        </div>
        
        <div className="text-center mt-3">
          <a 
            href="/games" 
            className="text-primary hover:text-primary/80 text-sm font-medium underline decoration-primary/30 hover:decoration-primary transition-colors"
          >
            Browse more games →
          </a>
        </div>
      </div>
    </div>
  );
}