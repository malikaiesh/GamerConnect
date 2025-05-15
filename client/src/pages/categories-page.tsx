import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GameGrid } from '@/components/games/game-grid';
import { Game } from '@shared/schema';
import { fetcher } from '@/lib/queryClient';

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch all categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery<string[]>({
    queryKey: ['/api/games/categories'],
    queryFn: () => fetcher('/api/games/categories'),
  });
  
  // Fetch top categories for featured section
  const { data: topCategories = [], isLoading: loadingTopCategories } = useQuery<string[]>({
    queryKey: ['/api/games/categories/top'],
    queryFn: () => fetcher('/api/games/categories/top'),
  });
  
  // Fetch games based on selected category
  const { data: gamesData, isLoading: loadingGames } = useQuery<{games: Game[], pagination: any}>({
    queryKey: ['/api/games/popular', { category: activeCategory }],
    queryFn: () => activeCategory ? fetcher(`/api/games/popular?category=${encodeURIComponent(activeCategory)}`) : Promise.resolve({games: [], pagination: {}}),
    enabled: !!activeCategory,
  });
  
  // Extract games array from response
  const games = gamesData?.games || [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-secondary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
              EXPLORE OUR COLLECTION
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-foreground font-extrabold">
              Game Categories
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Browse games by category and discover new favorites in your preferred genre.
            </p>
          </div>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="heading-md mb-8">Browse By Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loadingCategories ? (
              // Loading skeletons
              Array(10).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted aspect-square rounded-xl mb-2"></div>
                  <div className="bg-muted h-4 w-2/3 rounded"></div>
                </div>
              ))
            ) : (
              // Category cards
              categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="group outline-none focus:outline-none"
                >
                  <div className={`relative bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-md transition-all duration-500 hover:scale-105 hover:shadow-xl ${activeCategory === category ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'hover:ring-1 hover:ring-primary/50'}`}>
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Border glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                    
                    <div className="aspect-square flex items-center justify-center relative z-10">
                      <div className="relative">
                        {/* Background circle */}
                        <div className="absolute inset-0 -m-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500 blur-sm"></div>
                        <div className="text-5xl text-primary relative group-hover:scale-110 transition-all duration-500">
                          {/* Use different icons based on category */}
                          {category === 'Sports' && <i className="ri-basketball-line"></i>}
                          {category === 'Adventure' && <i className="ri-compass-3-line"></i>}
                          {category === 'Strategy' && <i className="ri-chess-line"></i>}
                          {category === 'Racing' && <i className="ri-steering-2-line"></i>}
                          {category === 'Platformer' && <i className="ri-game-line"></i>}
                          {category === 'Puzzle' && <i className="ri-puzzle-line"></i>}
                          {category === 'Action' && <i className="ri-sword-line"></i>}
                          {category === 'RPG' && <i className="ri-sword-line"></i>}
                          {/* Default icon if category not matched */}
                          {!['Sports', 'Adventure', 'Strategy', 'Racing', 'Platformer', 'Puzzle', 'Action', 'RPG'].includes(category) && 
                            <i className="ri-gamepad-line"></i>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 text-center relative z-10 border-t border-primary/10 bg-gradient-to-t from-background/80 to-background/30">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">{category}</h3>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Selected Category Games */}
      {activeCategory && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-md">{activeCategory} Games</h2>
              <button 
                onClick={() => setActiveCategory(null)}
                className="text-primary hover:underline flex items-center"
              >
                <i className="ri-arrow-left-line mr-1"></i> All Categories
              </button>
            </div>
            
            <GameGrid 
              games={games} 
              loading={loadingGames}
              columns={4}
              cardSize="md"
              hasMoreGames={false}
            />
          </div>
        </section>
      )}
      
      {/* Featured Categories */}
      {!activeCategory && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="heading-md mb-6">Popular Categories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingTopCategories ? (
                // Loading skeletons
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted h-48 rounded-xl mb-2"></div>
                    <div className="bg-muted h-5 w-1/3 rounded mb-2"></div>
                    <div className="bg-muted h-4 w-2/3 rounded"></div>
                  </div>
                ))
              ) : (
                // Featured category cards
                topCategories.slice(0, 3).map((category) => (
                  <div key={category} className="relative group rounded-xl overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
                    {/* Card background with gradient overlay */}
                    <div 
                      className="h-56 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(https://source.unsplash.com/random/400x300/?${category.toLowerCase()},game)` 
                      }}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90 group-hover:opacity-90 transition-opacity duration-500"></div>
                      
                      {/* Glowing border effect on hover */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 rounded-xl ring-1 ring-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:translate-y-0 z-10">
                        <span className="inline-block bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full px-3 py-1 text-xs font-medium text-primary mb-3">
                          POPULAR CATEGORY
                        </span>
                        <h3 className="text-foreground text-2xl font-extrabold mb-3 group-hover:text-primary transition-colors">{category}</h3>
                        <p className="text-foreground/80 mb-4 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500">
                          Explore the best {category} games in our collection.
                        </p>
                        <button 
                          onClick={() => setActiveCategory(category)}
                          className="relative overflow-hidden bg-primary text-primary-foreground rounded-full py-2 px-5 font-medium inline-flex items-center gap-2 transition-all duration-300 
                          before:absolute before:inset-0 before:bg-white/20 before:scale-x-0 before:opacity-50 before:origin-left
                          hover:before:scale-x-100 before:transition-transform before:duration-300"
                        >
                          <span className="relative z-10">Explore Games</span>
                          <i className="ri-arrow-right-line relative z-10"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
}