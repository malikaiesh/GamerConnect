import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/queryClient';

interface GameFiltersProps {
  onFilter: (category: string) => void;
  activeCategory: string;
}

export function GameFilters({ onFilter, activeCategory }: GameFiltersProps) {
  const [scrollable, setScrollable] = useState(false);
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/games/categories'],
    queryFn: fetcher,
  });

  // Add a container ref to check if we need horizontal scrolling
  useEffect(() => {
    const checkOverflow = () => {
      const container = document.getElementById('category-container');
      if (container) {
        setScrollable(container.scrollWidth > container.clientWidth);
      }
    };
    
    window.addEventListener('resize', checkOverflow);
    // Check after categories are loaded
    if (!isLoading) {
      setTimeout(checkOverflow, 100);
    }
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories, isLoading]);
  
  if (isLoading) {
    return (
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-10 w-20 bg-card animate-pulse rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div id="categories" className="bg-card/60 backdrop-blur-sm sticky top-16 md:top-20 z-30 shadow-md py-2">
      <div className="container mx-auto px-4">
        <div 
          id="category-container"
          className={`overflow-x-auto whitespace-nowrap py-2 ${scrollable ? 'scrollbar-hide' : ''}`}
        >
          <div className="flex space-x-2 md:space-x-4">
            <button 
              onClick={() => onFilter('all')}
              className={activeCategory === 'all' 
                ? 'bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium' 
                : 'bg-muted/70 hover:bg-muted text-foreground px-4 py-1.5 rounded-full text-sm font-medium'}
            >
              All Games
            </button>
            
            {categories.map((category: string) => (
              <button 
                key={category}
                onClick={() => onFilter(category)}
                className={activeCategory === category 
                  ? 'bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium' 
                  : 'bg-muted/70 hover:bg-muted text-foreground px-4 py-1.5 rounded-full text-sm font-medium'}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
