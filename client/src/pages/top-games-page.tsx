import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GameGrid } from '@/components/games/game-grid';
import { Rating } from '@/components/ui/rating';
import { Game } from '@shared/schema';
import { fetcher } from '@/lib/queryClient';

export default function TopGamesPage() {
  const [timeframe, setTimeframe] = useState('all_time'); // all_time, this_month, this_week
  
  // Fetch top games
  const { data: topGames = [], isLoading: loadingTopGames } = useQuery<Game[]>({
    queryKey: ['/api/games/top', { timeframe }],
    queryFn: () => fetcher(`/api/games/top${timeframe !== 'all_time' ? `?timeframe=${timeframe}` : ''}`),
  });
  
  // For the hero section, use the top game if available
  const heroGame = topGames.length > 0 ? topGames[0] : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      {heroGame ? (
        <section className="relative text-white">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${heroGame.thumbnail})`,
              filter: 'blur(8px)',
              opacity: '0.4',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/20"></div>
          
          <div className="container mx-auto px-4 py-16 relative">
            <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  #1 Top Game
                </span>
                <h1 className="heading-xl my-4 text-white">{heroGame.title}</h1>
                <div className="flex items-center mb-4">
                  <Rating 
                    initialRating={heroGame.rating / heroGame.ratingCount} 
                    interactive={false}
                    size="md"
                  />
                  <span className="text-white/80 ml-2">
                    ({(heroGame.rating / heroGame.ratingCount).toFixed(1)}) from {heroGame.ratingCount} ratings
                  </span>
                </div>
                <p className="text-white/80 mb-6">
                  {heroGame.description}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {heroGame.category}
                  </span>
                  {heroGame.tags.map((tag, index) => (
                    <span key={index} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <a 
                  href={`/game/${heroGame.id}`} 
                  className="btn-primary inline-block"
                >
                  Play Now
                </a>
              </div>
              <div className="md:w-1/2">
                <img 
                  src={heroGame.thumbnail}
                  alt={heroGame.title}
                  className="rounded-xl shadow-2xl transform rotate-2 max-w-full"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-xl mb-4">Top Rated Games</h1>
              <p className="text-lg md:text-xl opacity-90">
                Discover the most popular and highly-rated games on our platform.
              </p>
            </div>
          </div>
        </section>
      )}
      
      {/* Top Games Tabs */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="heading-md">Top Games</h2>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button 
                onClick={() => setTimeframe('all_time')}
                className={`px-4 py-2 text-sm ${timeframe === 'all_time' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setTimeframe('this_month')}
                className={`px-4 py-2 text-sm ${timeframe === 'this_month' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => setTimeframe('this_week')}
                className={`px-4 py-2 text-sm ${timeframe === 'this_week' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
              >
                This Week
              </button>
            </div>
          </div>
          
          {/* Note: For simplicity, we're using the same data for all timeframes. 
              In a real app, you'd make different queries based on the selected timeframe. */}
          <div className="space-y-8">
            {/* Top Games Grid */}
            <GameGrid 
              games={topGames.slice(heroGame ? 1 : 0)} // Skip the hero game if it exists
              loading={loadingTopGames}
              columns={4}
              cardSize="md"
              hasMoreGames={false}
              showRank={true}
              rankOffset={heroGame ? 1 : 0}
            />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}