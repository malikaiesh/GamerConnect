import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/date-utils";
import { PageHeader } from "@/components/page-header";
import CategoryFormDialog from "@/components/admin/category-form-dialog";
import DeleteConfirmDialog from "@/components/admin/delete-confirm-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameCategory } from "@shared/schema";

export default function GameCategoriesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories?includeInactive=true');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<GameCategory>) => {
      const response = await apiRequest('POST', '/api/categories', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Category created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<GameCategory> }) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (category: GameCategory) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: GameCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSubmit = (data: Partial<GameCategory>) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: Partial<GameCategory>) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Game Categories" subtitle="Manage game categories for your platform" />
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="bg-card/60 backdrop-blur-sm border shadow-md">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: GameCategory) => (
                    <TableRow key={category.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <i className={`${category.icon || 'ri-gamepad-line'} mr-2 text-lg`}></i>
                          {category.icon || 'ri-gamepad-line'}
                        </span>
                      </TableCell>
                      <TableCell>{category.displayOrder}</TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                          title="Delete"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No categories found</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                Create your first category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <CategoryFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubmit}
        title="Add New Category"
        isPending={createMutation.isPending}
      />

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <CategoryFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditSubmit}
          title="Edit Category"
          isPending={updateMutation.isPending}
          defaultValues={selectedCategory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedCategory && (
        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          description={`Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}