import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogPost, BlogCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PostsListProps {
  onEditPost: (post: BlogPost) => void;
  onAddPost: () => void;
}

export function PostsList({ onEditPost, onAddPost }: PostsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  
  // Fetch posts with filters and pagination
  const { data, isLoading } = useQuery({
    queryKey: ['/api/blog/posts', page, limit, search, categoryFilter, statusFilter],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) queryParams.append('search', search);
      if (categoryFilter !== 'all') queryParams.append('categoryId', categoryFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      
      return fetch(`/api/blog/posts?${queryParams.toString()}`).then(res => res.json());
    }
  });
  
  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/blog/posts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setPostToDelete(null);
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
      return apiRequest('POST', '/api/blog/posts/bulk-delete', { ids });
    },
    onSuccess: () => {
      toast({
        title: "Posts deleted",
        description: `${selectedPosts.length} posts have been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setSelectedPosts([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Format date for display
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedPosts.length === data?.posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(data?.posts.map(post => post.id) || []);
    }
  };
  
  // Handle individual checkbox
  const handleSelectPost = (id: number) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter(postId => postId !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) return;
    bulkDeleteMutation.mutate(selectedPosts);
  };
  
  // Calculate pagination
  const totalPages = data?.totalPages || 1;
  
  // Find category name by id
  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <Input
            placeholder="Search posts..."
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onAddPost} variant="default">
            <Plus className="h-4 w-4 mr-2" /> Add Post
          </Button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="bg-muted p-2 rounded-md flex justify-between items-center">
          <span>{selectedPosts.length} posts selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
            {bulkDeleteMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Delete Selected
          </Button>
        </div>
      )}
      
      {/* Posts Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={data?.posts?.length > 0 && selectedPosts.length === data?.posts?.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all posts"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
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
            ) : data?.posts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No posts found. Try a different search or add a new post.
                </TableCell>
              </TableRow>
            ) : (
              data?.posts?.map((post: BlogPost) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => handleSelectPost(post.id)}
                      aria-label={`Select ${post.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="truncate max-w-[150px]">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getCategoryName(post.categoryId)}</TableCell>
                  <TableCell className="hidden md:table-cell">{post.author}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditPost(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog open={postToDelete?.id === post.id} onOpenChange={(open) => !open && setPostToDelete(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setPostToDelete(post)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Post</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPostToDelete(null)}>Cancel</Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => deleteMutation.mutate(post.id)}
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
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data?.totalPosts || 0)} of {data?.totalPosts || 0}
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
