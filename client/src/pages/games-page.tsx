import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GameGrid } from '@/components/games/game-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { Game, GameCategory } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch all categories for filter
  const { data: categories = [] } = useQuery<GameCategory[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch games with filters
  const { data: gamesResponse, isLoading } = useQuery<{
    games: Game[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ['/api/games/popular', { 
      search: searchQuery, 
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sort: sortBy,
      page 
    }],
  });

  const games = gamesResponse?.games || [];
  const pagination = gamesResponse?.pagination;

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-secondary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
              ALL GAMES
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-extrabold">
              🎮 All Games
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Discover our complete collection of games - find your next favorite adventure
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                data-testid="search-games"
              />
            </div>

            <div className="flex gap-2 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="button-list-view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button 
                    onClick={() => handleSearch('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button 
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-12 bg-background flex-grow">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          {pagination && (
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {games.length} of {pagination.total} games
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !games.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-40 rounded-xl mb-2"></div>
                  <div className="bg-muted h-4 w-3/4 rounded mb-1"></div>
                  <div className="bg-muted h-3 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 bg-muted/50 rounded-lg inline-block">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Games Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 
                    `No games found matching "${searchQuery}"` : 
                    `No games found in ${selectedCategory} category`
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <GameGrid 
              games={games}
              loading={isLoading}
              columns={viewMode === 'grid' ? 5 : 3}
              cardSize={viewMode === 'grid' ? 'md' : 'lg'}
              showLoadMore={pagination ? page < pagination.totalPages : false}
              onLoadMore={handleLoadMore}
              hasMoreGames={pagination ? page < pagination.totalPages : false}
              loadMoreLabel="Load More Games"
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}