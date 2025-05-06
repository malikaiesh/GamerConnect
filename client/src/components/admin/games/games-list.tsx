import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";

interface GamesListProps {
  onEditGame: (game: Game) => void;
  onAddGame: () => void;
}

export function GamesList({ onEditGame, onAddGame }: GamesListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  
  // Fetch games with filters and pagination
  const { data, isLoading } = useQuery({
    queryKey: ['/api/games', page, limit, search, categoryFilter, sourceFilter, statusFilter],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) queryParams.append('search', search);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (sourceFilter !== 'all') queryParams.append('source', sourceFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      
      return fetch(`/api/games?${queryParams.toString()}`).then(res => res.json());
    }
  });
  
  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/games/categories'],
  });
  
  // Delete game mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/games/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Game deleted",
        description: "The game has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setGameToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return apiRequest('POST', '/api/games/bulk-delete', { ids });
    },
    onSuccess: () => {
      toast({
        title: "Games deleted",
        description: `${selectedGames.length} games have been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setSelectedGames([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedGames.length === data?.games.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(data?.games.map(game => game.id) || []);
    }
  };
  
  // Handle individual checkbox
  const handleSelectGame = (id: number) => {
    if (selectedGames.includes(id)) {
      setSelectedGames(selectedGames.filter(gameId => gameId !== id));
    } else {
      setSelectedGames([...selectedGames, id]);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedGames.length === 0) return;
    bulkDeleteMutation.mutate(selectedGames);
  };
  
  // Calculate pagination
  const totalPages = data?.totalPages || 1;
  
  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-60"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onAddGame} variant="default">
            <Plus className="h-4 w-4 mr-2" /> Add Game
          </Button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedGames.length > 0 && (
        <div className="bg-muted p-2 rounded-md flex justify-between items-center">
          <span>{selectedGames.length} games selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
            {bulkDeleteMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Delete Selected
          </Button>
        </div>
      )}
      
      {/* Games Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={data?.games?.length > 0 && selectedGames.length === data?.games?.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all games"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Plays</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data?.games?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No games found. Try a different search or add a new game.
                </TableCell>
              </TableRow>
            ) : (
              data?.games?.map((game: Game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGames.includes(game.id)}
                      onCheckedChange={() => handleSelectGame(game.id)}
                      aria-label={`Select ${game.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="truncate max-w-[150px]">{game.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{game.category}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{game.source}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      game.status === 'active' ? 'bg-green-100 text-green-800' :
                      game.status === 'featured' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {game.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{game.plays.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/game/${game.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditGame(game)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog open={gameToDelete?.id === game.id} onOpenChange={(open) => !open && setGameToDelete(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setGameToDelete(game)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Game</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{game.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setGameToDelete(null)}>Cancel</Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => deleteMutation.mutate(game.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data?.totalGames || 0)} of {data?.totalGames || 0}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Create a simple pagination with ... for many pages
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                if (pageNum <= totalPages) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
