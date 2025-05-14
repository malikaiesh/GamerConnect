import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/queryClient';

interface GameFiltersProps {
  onFilter: (category: string) => void;
  activeCategory: string;
}

export function GameFilters({ onFilter, activeCategory }: GameFiltersProps) {
  const [scrollable, setScrollable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Pre-defined default categories to use as fallback
  const defaultCategories = ['Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy'];
  
  const { 
    data: categories = [], 
    isLoading,
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/games/categories'],
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000
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
    
    // Check after categories are loaded with a delay to ensure DOM is updated
    if (!isLoading) {
      const timer = setTimeout(checkOverflow, 200);
      return () => clearTimeout(timer);
    }
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories, isLoading]);
  
  // Auto retry if there's an error
  useEffect(() => {
    if (isError && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isError, retryCount, refetch]);
  
  // If error persists after retries, use default categories
  const displayCategories = isError ? defaultCategories : categories;
  
  // Show loading state when loading
  if (isLoading && !isError) {
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
    <div id="categories" className="bg-card/60 rounded-lg py-2">
      <div className="container mx-auto">
        <div 
          id="category-container"
          className={`overflow-x-auto whitespace-nowrap py-2 ${scrollable ? 'scrollbar-hide' : ''}`}
        >
          <div className="flex space-x-3 md:space-x-4">
            <button 
              onClick={() => onFilter('all')}
              className={activeCategory === 'all' 
                ? 'bg-primary text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md' 
                : 'bg-muted/70 hover:bg-muted/90 text-foreground px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm'}
            >
              All Games
            </button>
            
            {displayCategories.map((category: string) => (
              <button 
                key={category}
                onClick={() => onFilter(category)}
                className={activeCategory === category 
                  ? 'bg-primary text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md' 
                  : 'bg-muted/70 hover:bg-muted/90 text-foreground px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm'}
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
