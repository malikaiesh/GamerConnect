import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { HomepageContentForm } from "@/components/admin/homepage-content-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { HomePageContent } from "@shared/schema";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminHomepageContent() {
  const [selectedContent, setSelectedContent] = useState<HomePageContent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all homepage content
  const { data: contents = [], isLoading, error } = useQuery<HomePageContent[]>({
    queryKey: ['/api/homepage-content'],
  });

  // Create homepage content mutation
  const createContentMutation = useMutation({
    mutationFn: async (newContent: Partial<HomePageContent>) => {
      const res = await apiRequest('POST', '/api/homepage-content', newContent);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content/active'] });
      setIsCreateDialogOpen(false);
    },
  });

  // Update homepage content mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: Partial<HomePageContent> }) => {
      const res = await apiRequest('PUT', `/api/homepage-content/${id}`, content);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content/active'] });
      setIsEditDialogOpen(false);
      setSelectedContent(null);
    },
  });

  // Delete homepage content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/homepage-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content/active'] });
      setIsDeleteDialogOpen(false);
      setSelectedContent(null);
      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const handleCreateSubmit = async (values: any) => {
    await createContentMutation.mutateAsync(values);
  };

  // Handle edit form submission
  const handleEditSubmit = async (values: any) => {
    if (selectedContent) {
      await updateContentMutation.mutateAsync({ id: selectedContent.id, content: values });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedContent) {
      await deleteContentMutation.mutateAsync(selectedContent.id);
    }
  };

  const activeContents = contents.filter(content => content.status === 'active');
  const inactiveContents = contents.filter(content => content.status === 'inactive');

  return (
    <AdminLayout title="Homepage Content Management">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Homepage Content Management</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Homepage Content</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create content that will be displayed on the homepage. Content with 'Active' status will be shown to users.
                </DialogDescription>
              </DialogHeader>
              <HomepageContentForm onSubmit={handleCreateSubmit} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            Error loading content. Please try again.
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Content ({activeContents.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Content ({inactiveContents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeContents.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-md">
                  No active content found. Create content and set it as active to display on the homepage.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {activeContents.map((content) => (
                    <ContentCard 
                      key={content.id} 
                      content={content}
                      onEdit={() => {
                        setSelectedContent(content);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedContent(content);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive">
              {inactiveContents.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-md">
                  No inactive content found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {inactiveContents.map((content) => (
                    <ContentCard 
                      key={content.id} 
                      content={content}
                      onEdit={() => {
                        setSelectedContent(content);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedContent(content);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Homepage Content</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update the content that will be displayed on the homepage.
              </DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <HomepageContentForm 
                defaultValues={{
                  title: selectedContent.title,
                  content: selectedContent.content,
                  status: selectedContent.status,
                  position: selectedContent.position,
                }}
                onSubmit={handleEditSubmit}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the selected content from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

interface ContentCardProps {
  content: HomePageContent;
  onEdit: () => void;
  onDelete: () => void;
}

function ContentCard({ content, onEdit, onDelete }: ContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">{content.title}</CardTitle>
            <CardDescription className="text-muted-foreground">Position: {content.position}</CardDescription>
          </div>
          <Badge variant={content.status === 'active' ? 'default' : 'secondary'}>
            {content.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-40 overflow-y-auto prose prose-sm dark:prose-invert">
          {content.content.split('\n\n').slice(0, 3).map((paragraph, idx) => (
            <p key={idx} className="mb-2 text-muted-foreground">{paragraph}</p>
          ))}
          {content.content.split('\n\n').length > 3 && (
            <p className="text-sm text-muted-foreground font-italic">... more content not shown</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1">
          <Edit size={16} />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="flex items-center gap-1">
          <Trash2 size={16} />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}