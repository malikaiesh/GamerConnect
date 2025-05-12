import { Link, useLocation } from 'wouter';
import { Rating } from '@/components/ui/rating';
import { Game } from '@shared/schema';

interface GameCardProps {
  game: Game;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  showCategory?: boolean;
  showPlays?: boolean;
  rank?: number;
  onClick?: () => void;
}

export function GameCard({ 
  game, 
  size = 'md',
  showRating = true,
  showCategory = true,
  showPlays = true,
  rank,
  onClick
}: GameCardProps) {
  const [location, setLocation] = useLocation();
  
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
  
  // Use slug URL if available, otherwise fall back to ID-based URL
  const gamePath = game.slug ? `/g/${game.slug}` : `/game/${game.id}`;
  const averageRating = calculateAverageRating();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(gamePath);
    }
  };
  
  const handleImageClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  const handleButtonClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <div className={`${sizeClasses[size].card} hover:shadow-xl transition-shadow duration-300 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick ? handleClick : undefined}>
      <div className="relative">
        <Link href={gamePath}>
          <img 
            src={game.thumbnail} 
            alt={`${game.title} - Game Thumbnail`} 
            className={`${sizeClasses[size].image} hover:opacity-90 transition-opacity`}
            loading="lazy"
            onClick={handleImageClick}
          />
        </Link>
        
        {game.status === 'featured' && (
          <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </span>
        )}
        
        {rank && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
            {rank}
          </span>
        )}
      </div>
      
      <div className={sizeClasses[size].content}>
        <Link href={gamePath} onClick={handleImageClick}>
          <h3 className={`${sizeClasses[size].title} hover:text-primary transition-colors`}>{game.title}</h3>
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
          onClick={handleButtonClick}
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
