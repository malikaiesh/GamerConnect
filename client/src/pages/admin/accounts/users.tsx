import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Search, Shield, ShieldAlert, UserCheck, UserX } from "lucide-react";

export default function AccountsUsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "blocked">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Map tab value to status for API
  const getStatusFromTab = (tab: string) => {
    if (tab === "active") return "active";
    if (tab === "blocked") return "blocked";
    return undefined; // all users
  };

  // Fetch users with pagination and filtering
  const { data, isLoading } = useQuery<{
    users: User[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['/api/admin/users', { status: getStatusFromTab(activeTab), page, limit, search }],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const statusParam = getStatusFromTab(activeTab) ? `&status=${getStatusFromTab(activeTab)}` : '';
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}${statusParam}${searchParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Get counts for active/blocked users for badges
  const { data: userStats } = useQuery<{
    totalUsers: number;
    activeUsers: number; 
    blockedUsers: number;
  }>({
    queryKey: ['/api/admin/user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/user-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return response.json();
    },
  });

  // Reset page when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "active" | "blocked");
    setPage(1);
  };

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: number; newStatus: 'active' | 'blocked' }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { status: newStatus });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-stats'] });
      toast({
        title: 'User status updated',
        description: `User has been ${selectedUser?.status === 'active' ? 'blocked' : 'activated'} successfully.`,
      });
      setSelectedUser(null);
      setIsConfirmDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle status change confirmation
  const handleStatusChangeConfirm = () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === 'active' ? 'blocked' : 'active';
    updateUserStatusMutation.mutate({ userId: selectedUser.id, newStatus });
  };

  // Prepare for status change
  const prepareStatusChange = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">User Accounts</h2>
          <div className="relative ml-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="relative">
              All Users
              {userStats && (
                <Badge className="ml-2 bg-gray-500">{userStats.totalUsers}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="relative">
              <UserCheck className="h-4 w-4 mr-1.5" /> 
              Active Users
              {userStats && (
                <Badge className="ml-2 bg-green-500">{userStats.activeUsers}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blocked" className="relative">
              <ShieldAlert className="h-4 w-4 mr-1.5" />
              Blocked Users
              {userStats && (
                <Badge className="ml-2 bg-red-500">{userStats.blockedUsers}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "All Users"}
                {activeTab === "active" && "Active Users"}
                {activeTab === "blocked" && "Blocked Users"}
              </CardTitle>
              <CardDescription>
                {activeTab === "all" && "View and manage all user accounts"}
                {activeTab === "active" && "View and manage active user accounts"}
                {activeTab === "blocked" && "View and manage blocked user accounts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.users.map((user) => (
                        <TableRow key={user.id} className={user.status === 'blocked' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.username}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span>{user.username}</span>
                              {user.isAdmin && (
                                <Badge className="ml-2 bg-purple-600">Admin</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.accountType === "local"
                                  ? "bg-slate-500"
                                  : user.accountType === "google"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }
                            >
                              {user.accountType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.status === "active"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.country || "-"}</TableCell>
                          <TableCell>
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                user.status === "active"
                                  ? "text-red-500 border-red-500 hover:bg-red-50"
                                  : "text-green-500 border-green-500 hover:bg-green-50"
                              }
                              onClick={() => prepareStatusChange(user)}
                              disabled={user.isAdmin || updateUserStatusMutation.isPending}
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" /> Block
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" /> Activate
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!data?.users.length && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-gray-500"
                          >
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {data && data.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <div className="cursor-pointer">
                            <PaginationPrevious 
                              onClick={() => page > 1 && setPage(p => p - 1)}
                              className={page === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </div>
                        </PaginationItem>
                        
                        {[...Array(data.totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              onClick={() => setPage(i + 1)}
                              isActive={page === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <div className="cursor-pointer">
                            <PaginationNext
                              onClick={() => page < data.totalPages && setPage(p => p + 1)}
                              className={page === data.totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </div>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === 'active' ? 'Block User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === 'active'
                ? `Are you sure you want to block ${selectedUser?.username}? They will no longer be able to log in.`
                : `Are you sure you want to activate ${selectedUser?.username}? They will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChangeConfirm}
              className={selectedUser?.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {selectedUser?.status === 'active' ? 'Block User' : 'Activate User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}