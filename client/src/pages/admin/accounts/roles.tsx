import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schemas
const roleFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

type RoleForm = z.infer<typeof roleFormSchema>;

// Define types for our data
interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string | null;
}

const RolesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState("roles");

  // Fetch roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      return response.json() as Promise<Role[]>;
    },
  });

  // Fetch permissions when a role is selected
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const response = await fetch("/api/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json() as Promise<Permission[]>;
    },
  });

  // Fetch role's permissions when a role is selected
  const { data: rolePermissions, isLoading: isLoadingRolePermissions } = useQuery({
    queryKey: ["/api/roles", selectedRole?.id, "permissions"],
    queryFn: async () => {
      if (!selectedRole) return [];
      const response = await fetch(`/api/roles/${selectedRole.id}/permissions`);
      if (!response.ok) throw new Error("Failed to fetch role permissions");
      return response.json() as Promise<Permission[]>;
    },
    enabled: !!selectedRole,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleForm) => {
      const response = await apiRequest("POST", "/api/roles", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Created",
        description: "The role has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: number; role: Partial<RoleForm> }) => {
      const response = await apiRequest("PUT", `/api/roles/${data.id}`, data.role);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "The role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/roles/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setSelectedRole(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle permission for role
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId, isAssigned }: { roleId: number; permissionId: number; isAssigned: boolean }) => {
      if (isAssigned) {
        // Remove permission
        const response = await apiRequest("DELETE", `/api/roles/${roleId}/permissions/${permissionId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to remove permission");
        }
        return { roleId, permissionId, assigned: false };
      } else {
        // Assign permission
        const response = await apiRequest("POST", `/api/roles/${roleId}/permissions/${permissionId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to assign permission");
        }
        return { roleId, permissionId, assigned: true };
      }
    },
    onSuccess: (data) => {
      toast({
        title: data.assigned ? "Permission Assigned" : "Permission Removed",
        description: data.assigned 
          ? "The permission has been assigned to the role." 
          : "The permission has been removed from the role.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles", data.roleId, "permissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create role form
  const form = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Edit role form
  const editForm = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: selectedRole?.name || "",
      description: selectedRole?.description || "",
    },
  });

  // Update edit form when selected role changes
  useState(() => {
    if (selectedRole) {
      editForm.setValue("name", selectedRole.name);
      editForm.setValue("description", selectedRole.description || "");
    }
  });

  // Check if a permission is assigned to the selected role
  const isPermissionAssigned = (permissionId: number) => {
    if (!rolePermissions) return false;
    return rolePermissions.some((permission) => permission.id === permissionId);
  };

  // Group permissions by resource
  const getGroupedPermissions = () => {
    if (!permissions) return {};
    
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
      return groups;
    }, {});
  };

  const handleCreateRole = (data: RoleForm) => {
    createRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: RoleForm) => {
    if (!selectedRole) return;
    updateRoleMutation.mutate({ id: selectedRole.id, role: data });
  };

  const handleDeleteRole = (id: number) => {
    if (window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    if (!selectedRole) return;
    
    const isAssigned = isPermissionAssigned(permissionId);
    togglePermissionMutation.mutate({
      roleId: selectedRole.id,
      permissionId,
      isAssigned,
    });
  };

  // Loading states
  if (isLoadingRoles) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions" disabled={!selectedRole}>
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles?.map((role) => (
                    <TableRow 
                      key={role.id} 
                      className={selectedRole?.id === role.id ? "bg-muted/50" : ""}
                      onClick={() => setSelectedRole(role)}
                    >
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || "-"}</TableCell>
                      <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          disabled={role.name === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedRole && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Edit Role: {selectedRole.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleUpdateRole)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={selectedRole.name === "admin" || updateRoleMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              disabled={updateRoleMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={selectedRole.name === "admin" || updateRoleMutation.isPending}
                      >
                        {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions">
          {selectedRole && (
            <Card>
              <CardHeader>
                <CardTitle>Permissions for {selectedRole.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPermissions || isLoadingRolePermissions ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(getGroupedPermissions()).map(([resource, resourcePermissions]) => (
                      <div key={resource} className="border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-3 capitalize">{resource}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {resourcePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={isPermissionAssigned(permission.id)}
                                onCheckedChange={() => handleTogglePermission(permission.id)}
                                disabled={
                                  selectedRole.name === "admin" || 
                                  togglePermissionMutation.isPending
                                }
                              />
                              <label
                                htmlFor={`permission-${permission.id}`}
                                className="text-sm capitalize"
                              >
                                {permission.action}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system. Roles can be assigned to users and given specific permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateRole)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Content Editor" />
                    </FormControl>
                    <FormDescription>A unique name for the role</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="e.g., Can manage blog content and categories" />
                    </FormControl>
                    <FormDescription>A brief description of what this role can do</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoleMutation.isPending}>
                  {createRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Role
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;