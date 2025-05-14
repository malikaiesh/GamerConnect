import React, { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PencilIcon, Plus, ExternalLink, ToggleLeft, ToggleRight, Search, RefreshCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { 
  UrlRedirect, 
  UrlRedirectInsert, 
  UrlRedirectUpdate,
  urlRedirectInsertSchema, 
  urlRedirectUpdateSchema 
} from "@shared/schema";
import Pagination from "@/components/ui/pagination";

const redirectFormSchema = urlRedirectInsertSchema.extend({
  sourceUrl: z.string().min(1, "Source URL is required").startsWith("/", "Source URL must start with /"),
  targetUrl: z.string().min(1, "Target URL is required"),
  statusCode: z.coerce.number().int().gte(300).lte(308),
});

type RedirectFormValues = z.infer<typeof redirectFormSchema>;

const defaultValues: Partial<RedirectFormValues> = {
  sourceUrl: "",
  targetUrl: "",
  statusCode: 301,
  isActive: true,
};

export default function RedirectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRedirect, setCurrentRedirect] = useState<UrlRedirect | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const form = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues,
  });

  const editForm = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema.partial()),
    defaultValues,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/redirects', page, limit, search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/redirects?page=${page}&limit=${limit}${searchParam}`);
      if (!response.ok) throw new Error('Failed to fetch redirects');
      return await response.json();
    }
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/redirects'] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: UrlRedirectInsert) => {
      const response = await apiRequest('POST', '/api/redirects', data);
      return await response.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      form.reset(defaultValues);
      invalidateQueries();
      toast({
        title: "Redirect created",
        description: "The redirect has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating redirect",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UrlRedirectUpdate }) => {
      const response = await apiRequest('PUT', `/api/redirects/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      invalidateQueries();
      toast({
        title: "Redirect updated",
        description: "The redirect has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating redirect",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/redirects/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setCurrentRedirect(null);
      invalidateQueries();
      toast({
        title: "Redirect deleted",
        description: "The redirect has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting redirect",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/redirects/${id}/toggle`);
      return await response.json();
    },
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: "Status updated",
        description: "The redirect status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RedirectFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: RedirectFormValues) => {
    if (!currentRedirect) return;
    updateMutation.mutate({ id: currentRedirect.id, data: values });
  };

  const handleEditClick = (redirect: UrlRedirect) => {
    setCurrentRedirect(redirect);
    editForm.reset({
      sourceUrl: redirect.sourceUrl,
      targetUrl: redirect.targetUrl,
      statusCode: redirect.statusCode,
      isActive: redirect.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (redirect: UrlRedirect) => {
    setCurrentRedirect(redirect);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (redirect: UrlRedirect) => {
    toggleMutation.mutate(redirect.id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">URL Redirects</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Redirect
          </Button>
        </div>

        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search redirects..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  refetch();
                }
              }}
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Source URL</TableHead>
                <TableHead className="w-[200px]">Target URL</TableHead>
                <TableHead className="w-[100px]">Status Code</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.redirects?.length > 0 ? (
                data.redirects.map((redirect: UrlRedirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-medium">
                      {redirect.sourceUrl}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="truncate max-w-[180px]">
                          {redirect.targetUrl}
                        </span>
                        {redirect.targetUrl.startsWith('http') && (
                          <a 
                            href={redirect.targetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{redirect.statusCode}</TableCell>
                    <TableCell>
                      <Badge
                        variant={redirect.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(redirect)}
                      >
                        {redirect.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(redirect)}
                          title="Edit redirect"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(redirect)}
                          className="text-destructive"
                          title="Delete redirect"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No redirects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && data.pagination.total > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Create Redirect Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Redirect</DialogTitle>
              <DialogDescription>
                Create a URL redirect to automatically send users from one page to another.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/old-page" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL path that will be redirected (must start with /).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/new-page or https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where users will be redirected to. Can be a relative URL or absolute URL.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Status Code</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="301">301 - Permanent Redirect</SelectItem>
                          <SelectItem value="302">302 - Temporary Redirect</SelectItem>
                          <SelectItem value="303">303 - See Other</SelectItem>
                          <SelectItem value="307">307 - Temporary Redirect (Strict)</SelectItem>
                          <SelectItem value="308">308 - Permanent Redirect (Strict)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        301 (permanent) is recommended for most cases.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Redirect Status</FormLabel>
                        <FormDescription>
                          Toggle whether this redirect is active or not.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Button
                          type="button"
                          variant={field.value ? "default" : "outline"}
                          onClick={() => field.onChange(!field.value)}
                          className="ml-2"
                        >
                          {field.value ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Inactive
                            </>
                          )}
                        </Button>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Redirect"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Redirect Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Redirect</DialogTitle>
              <DialogDescription>
                Update the URL redirect settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/old-page" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL path that will be redirected (must start with /).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/new-page or https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where users will be redirected to. Can be a relative URL or absolute URL.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="statusCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Status Code</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="301">301 - Permanent Redirect</SelectItem>
                          <SelectItem value="302">302 - Temporary Redirect</SelectItem>
                          <SelectItem value="303">303 - See Other</SelectItem>
                          <SelectItem value="307">307 - Temporary Redirect (Strict)</SelectItem>
                          <SelectItem value="308">308 - Permanent Redirect (Strict)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        301 (permanent) is recommended for most cases.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Redirect Status</FormLabel>
                        <FormDescription>
                          Toggle whether this redirect is active or not.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Button
                          type="button"
                          variant={field.value ? "default" : "outline"}
                          onClick={() => field.onChange(!field.value)}
                          className="ml-2"
                        >
                          {field.value ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Inactive
                            </>
                          )}
                        </Button>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Redirect"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this redirect?
                {currentRedirect && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="font-medium text-foreground">{currentRedirect.sourceUrl} → {currentRedirect.targetUrl}</p>
                  </div>
                )}
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => currentRedirect && deleteMutation.mutate(currentRedirect.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Redirect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}