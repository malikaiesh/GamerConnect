import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Game } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { GameForm } from "@/components/admin/game-form";

export default function GamesAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all_categories");
  const [status, setStatus] = useState("all_statuses");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Query for getting games with filtering and pagination
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/games", page, limit, search, category, status],
    queryFn: async () => {
      let url = `/api/games?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      // Only send category if it's not the "all categories" option
      if (category && category !== "all_categories") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      // Only send status if it's not the "all statuses" option
      if (status && status !== "all_statuses") {
        url += `&status=${encodeURIComponent(status)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });

  // Query for getting game categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/games/categories"],
    queryFn: async () => {
      const res = await fetch("/api/games/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
  
  // Mutation for deleting a game
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Game deleted",
        description: "Game has been deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit button click
  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteGame = (game: Game) => {
    setSelectedGame(game);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedGame) {
      deleteMutation.mutate(selectedGame.id);
    }
  };

  // Calculate total pages
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Manage Games</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Game</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill out the form below to create a new game.
              </DialogDescription>
            </DialogHeader>
            <GameForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-row gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_categories">All Categories</SelectItem>
              {categories.map((cat: string) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Games Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Source</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Plays</TableHead>
              <TableHead className="text-foreground">Rating</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading games...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-destructive">
                  Error loading games
                </TableCell>
              </TableRow>
            ) : data.games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No games found
                </TableCell>
              </TableRow>
            ) : (
              data.games.map((game: Game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="h-10 w-10 rounded object-cover" 
                      />
                      {game.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{game.category}</TableCell>
                  <TableCell className="text-foreground">{game.source === "api" ? "API" : "Custom"}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                      game.status === "active" ? "bg-green-600/20 text-green-600" :
                      game.status === "featured" ? "bg-primary/20 text-primary" :
                      "bg-muted/70 text-muted-foreground"
                    }`}>
                      {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>{game.plays}</TableCell>
                  <TableCell>
                    {game.ratingCount > 0 
                      ? (game.rating / game.ratingCount).toFixed(1) + ` (${game.ratingCount})`
                      : "No ratings"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditGame(game)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteGame(game)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 py-1">{page} / {totalPages}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Edit Game Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Game</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Make changes to the game details.
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <GameForm 
              game={selectedGame} 
              onSuccess={() => setEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete the game "{selectedGame?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}