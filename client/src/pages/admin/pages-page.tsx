import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Edit, Trash2, Plus, File, Search, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { pageTypeEnum, contentStatusEnum } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/pagination";
import { StaticPage } from "@shared/schema";

export default function PagesAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Page state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pageType, setPageType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);

  // Query
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<{ 
    pages: StaticPage[]; 
    totalPages: number; 
    totalCount: number; 
  }>({
    queryKey: ['/api/pages', page, limit, search, pageType, status],
    queryFn: () => {
      let url = `/api/pages?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (pageType && pageType !== 'all') url += `&pageType=${encodeURIComponent(pageType)}`;
      if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
      return fetch(url).then(res => res.json());
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete page');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "The page has been successfully deleted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setDeletingPageId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    setDeletingPageId(id);
  };

  const confirmDelete = () => {
    if (deletingPageId) {
      deleteMutation.mutate(deletingPageId);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    refetch();
  };

  const getPageTypeBadge = (type: string) => {
    switch (type) {
      case 'about':
        return <Badge className="bg-blue-500">About</Badge>;
      case 'contact':
        return <Badge className="bg-green-500">Contact</Badge>;
      case 'privacy':
        return <Badge className="bg-purple-500">Privacy</Badge>;
      case 'terms':
        return <Badge className="bg-orange-500">Terms</Badge>;
      case 'cookie-policy':
        return <Badge className="bg-yellow-500">Cookie Policy</Badge>;
      case 'faq':
        return <Badge className="bg-pink-500">FAQ</Badge>;
      case 'custom':
        return <Badge className="bg-gray-500">Custom</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (!user?.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Static Pages</h1>
        <Button onClick={() => setLocation("/admin/pages/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>
            Manage static pages like About, Contact, Privacy Policy, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pages..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={pageType} onValueChange={setPageType}>
              <SelectTrigger>
                <SelectValue placeholder="Page Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(pageTypeEnum.enumValues).map((type) => (
                  <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(contentStatusEnum.enumValues).map((stat) => (
                  <SelectItem key={stat} value={stat}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit">
              <RefreshCw className="mr-2 h-4 w-4" /> Filter
            </Button>
          </form>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center p-12 text-destructive">
              <p>Error loading pages. Please try again.</p>
            </div>
          ) : !data || !data.pages || data.pages.length === 0 ? (
            <div className="text-center p-12 border rounded-lg border-dashed">
              <File className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No pages found</h3>
              <p className="text-muted-foreground">
                Get started by creating a new page.
              </p>
              <Button className="mt-4" onClick={() => setLocation("/admin/pages/new")}>
                <Plus className="mr-2 h-4 w-4" /> New Page
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Slug</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pages.map((page) => (
                    <tr key={page.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{page.title}</td>
                      <td className="py-3 px-4">{getPageTypeBadge(page.pageType)}</td>
                      <td className="py-3 px-4 font-mono text-xs">{page.slug}</td>
                      <td className="py-3 px-4 text-center">
                        {page.status === 'active' ? (
                          <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>
                        ) : (
                          <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/pages/${page.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {data?.totalCount
              ? `Showing ${(page - 1) * limit + 1} to ${Math.min(
                  page * limit,
                  data.totalCount
                )} of ${data.totalCount} pages`
              : "No pages found"}
          </div>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingPageId !== null} onOpenChange={(open) => !open && setDeletingPageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingPageId(null)}
            >
              Cancel
            </Button>
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