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
  const { data: games = [], isLoading: loadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games/popular', { category: activeCategory }],
    queryFn: () => activeCategory ? fetcher(`/api/games/popular?category=${encodeURIComponent(activeCategory)}`) : Promise.resolve([]),
    enabled: !!activeCategory,
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-xl mb-4">Game Categories</h1>
            <p className="text-lg md:text-xl opacity-90">
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
                  className={`group ${activeCategory === category ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="bg-card rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                      <div className="text-4xl text-primary">
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
                    <div className="p-4 text-center">
                      <h3 className="font-bold">{category}</h3>
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
                  <div key={category} className="bg-card rounded-xl overflow-hidden shadow-lg">
                    <div 
                      className="h-48 bg-cover bg-center flex items-end p-6"
                      style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), 
                        url(https://source.unsplash.com/random/400x300/?${category.toLowerCase()},game)` 
                      }}
                    >
                      <div>
                        <h3 className="text-white text-xl font-bold">{category}</h3>
                        <button 
                          onClick={() => setActiveCategory(category)}
                          className="mt-2 bg-primary/80 hover:bg-primary text-white text-sm py-1 px-3 rounded-full transition-colors"
                        >
                          Explore Games
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