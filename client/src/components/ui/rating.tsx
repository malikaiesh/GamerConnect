import { useState, useEffect } from 'react';

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function Rating({ 
  initialRating = 0, 
  totalStars = 5, 
  size = 'md',
  interactive = true,
  onChange,
  className = ''
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  
  // Update internal rating if initialRating prop changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);
  
  const handleClick = (selectedRating: number) => {
    if (!interactive) return;
    
    setRating(selectedRating);
    if (onChange) {
      onChange(selectedRating);
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };
  
  return (
    <div className={`star-rating flex text-yellow-400 ${sizeClasses[size]} ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        
        return (
          <span
            key={index}
            className={`star cursor-pointer ${!interactive ? 'cursor-default' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => interactive && setHover(starValue)}
            onMouseLeave={() => interactive && setHover(0)}
          >
            {starValue <= (hover || rating) ? (
              <i className="ri-star-fill" />
            ) : starValue === Math.ceil(rating) && !Number.isInteger(rating) ? (
              <i className="ri-star-half-line" />
            ) : (
              <i className="ri-star-line" />
            )}
          </span>
        );
      })}
    </div>
  );
}
