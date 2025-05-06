import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminNavigation } from "@/components/admin/navigation";
import { GamesList } from "@/components/admin/games/games-list";
import { GameForm } from "@/components/admin/games/game-form";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";

export default function AdminGames() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  // Fetch categories for the game form
  const { data: categories = [], isLoading: loadingCategories } = useQuery<string[]>({
    queryKey: ['/api/games/categories'],
  });
  
  // Handle editing a game
  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setIsCreateMode(false);
    if (activeTab !== "form") {
      setActiveTab("form");
    }
  };
  
  // Handle adding a new game
  const handleAddGame = () => {
    setSelectedGame(null);
    setIsCreateMode(true);
    setActiveTab("form");
  };
  
  // Handle dialog form submission success
  const handleFormSuccess = () => {
    if (dialogOpen) {
      setDialogOpen(false);
    }
    
    if (isCreateMode) {
      setSelectedGame(null);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Game Management</h1>
            <p className="text-muted-foreground">Manage your games catalog</p>
          </div>
          
          <Button onClick={handleAddGame}>
            <Plus className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Games List</TabsTrigger>
            <TabsTrigger value="form">
              {isCreateMode ? "Add New Game" : "Edit Game"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <GamesList
              onEditGame={handleEditGame}
              onAddGame={handleAddGame}
            />
          </TabsContent>
          
          <TabsContent value="form" className="space-y-4">
            {loadingCategories ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <GameForm
                game={selectedGame || undefined}
                categories={categories}
                onSuccess={handleFormSuccess}
              />
            )}
          </TabsContent>
        </Tabs>
        
        {/* Import Games Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Games</DialogTitle>
              <DialogDescription>
                Import games from GameMonetize API or other sources.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                API integration feature coming soon.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
