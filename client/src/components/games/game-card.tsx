import { Link } from 'wouter';
import { Rating } from '@/components/ui/rating';
import { Game } from '@shared/schema';

interface GameCardProps {
  game: Game;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  showCategory?: boolean;
  showPlays?: boolean;
  rank?: number;
}

export function GameCard({ 
  game, 
  size = 'md',
  showRating = true,
  showCategory = true,
  showPlays = true,
  rank
}: GameCardProps) {
  const calculateAverageRating = () => {
    if (game.ratingCount === 0) return 0;
    return game.rating / game.ratingCount;
  };
  
  const sizeClasses = {
    sm: {
      card: 'game-card bg-card rounded-xl shadow-lg overflow-hidden',
      image: 'w-full h-36 object-cover',
      title: 'text-md font-bold font-poppins text-foreground mb-1 truncate',
      content: 'p-3'
    },
    md: {
      card: 'game-card bg-card rounded-xl shadow-lg overflow-hidden',
      image: 'w-full h-40 object-cover',
      title: 'text-lg font-bold font-poppins text-foreground mb-2',
      content: 'p-4'
    },
    lg: {
      card: 'game-card bg-card rounded-xl shadow-lg overflow-hidden',
      image: 'w-full h-48 object-cover',
      title: 'text-xl font-bold font-poppins text-foreground mb-2',
      content: 'p-5'
    }
  };
  
  const gamePath = `/game/${game.id}`;
  const averageRating = calculateAverageRating();
  
  return (
    <div className={sizeClasses[size].card}>
      <div className="relative">
        <Link href={gamePath}>
          <img 
            src={game.thumbnail} 
            alt={`${game.title} - Game Thumbnail`} 
            className={sizeClasses[size].image}
            loading="lazy"
          />
        </Link>
        
        {game.status === 'featured' && (
          <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </span>
        )}
      </div>
      
      <div className={sizeClasses[size].content}>
        <Link href={gamePath}>
          <h3 className={sizeClasses[size].title}>{game.title}</h3>
        </Link>
        
        {showRating && (
          <div className="flex items-center mb-2">
            <Rating
              initialRating={averageRating}
              interactive={false}
              size={size === 'lg' ? 'md' : 'sm'}
            />
            <span className={`text-${size === 'sm' ? 'xs' : 'sm'} text-muted-foreground ml-2`}>
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
        
        {(showCategory || showPlays) && (
          <div className={`flex items-center text-xs text-muted-foreground ${size === 'sm' ? 'mb-2' : 'mb-3'}`}>
            {showCategory && (
              <span className="bg-muted px-2 py-1 rounded mr-2">
                {game.category}
              </span>
            )}
            
            {showPlays && (
              <span className="flex items-center">
                <i className="ri-gamepad-line mr-1"></i> {game.plays.toLocaleString()} plays
              </span>
            )}
          </div>
        )}
        
        <Link 
          href={gamePath}
          className={`block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center ${
            size === 'sm' ? 'py-1.5 text-sm' : 'py-2'
          } rounded-lg transition-colors`}
        >
          Play Now
        </Link>
      </div>
    </div>
  );
}
