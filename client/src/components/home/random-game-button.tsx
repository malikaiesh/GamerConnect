import { useLocation } from 'wouter';
import { Dices } from 'lucide-react';

interface RandomGameButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function RandomGameButton({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}: RandomGameButtonProps) {
  const [, setLocation] = useLocation();
  
  // Style classes based on variant and size
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10'
  };
  
  const sizeClasses = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6'
  };
  
  return (
    <button
      onClick={() => setLocation('/random')}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-md font-medium flex items-center justify-center transition-colors duration-200
        ${className}
      `}
      aria-label="Find a random game"
    >
      <Dices className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
      Random Game
    </button>
  );
}