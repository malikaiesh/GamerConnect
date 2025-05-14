import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import AdminNavigation from "@/components/admin/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, UserCheck, X, Shield, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the role form schema
const roleFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().optional().nullable(),
  // User management fields
  addUser: z.boolean().optional().default(false),
  email: z.string().email("Invalid email address").optional()
    .refine(email => !email || email.length > 0, {
      message: "Email is required when creating a user"
    }),
  password: z.string().optional()
    .refine(password => !password || password.length >= 8, {
      message: "Password must be at least 8 characters"
    }),
  // Multiple roles for user
  assignRoles: z.array(z.number()).optional(),
}).refine(data => {
  // If addUser is true, both email and password must be provided
  if (data.addUser) {
    return !!data.email && !!data.password;
  }
  return true;
}, {
  message: "Email and password are required when creating a user",
  path: ["addUser"],
});

type RoleForm = z.infer<typeof roleFormSchema>;

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

// Group permissions by resource for better display
const groupPermissionsByResource = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    if (!grouped[permission.resource]) {
      grouped[permission.resource] = [];
    }
    grouped[permission.resource].push(permission);
  });
  
  return grouped;
};

export default function RolesPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<"roles" | "permissions">("roles");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  
  // Predefined role templates
  const roleTemplates = [
    { value: "editor", label: "Editor", description: "Can edit content but not change system settings" },
    { value: "moderator", label: "Moderator", description: "Can manage users, games, and content but not settings" },
    { value: "analyst", label: "Analyst", description: "View only access to analytics and statistics" },
    { value: "content_editor", label: "Content Editor", description: "Can add and edit games and blog posts only" },
    { value: "admin", label: "Administrator", description: "Full access to all system functionality" },
    { value: "custom", label: "Custom Role", description: "" },
  ];

  // Fetch all roles
  const { 
    data: roles, 
    isLoading: isRolesLoading, 
    error: rolesError 
  } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Fetch all permissions for the permission management tab
  const { 
    data: permissions, 
    isLoading: isPermissionsLoading, 
    error: permissionsError 
  } = useQuery<Permission[]>({
    queryKey: ['/api/permissions'],
  });

  // Form for creating/editing roles
  const form = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      addUser: false,
      email: "",
      password: "",
    },
  });

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (isRoleDialogOpen) {
      if (dialogMode === "edit" && selectedRole) {
        form.reset({
          id: selectedRole.id,
          name: selectedRole.name,
          description: selectedRole.description,
          addUser: false,
          email: "",
          password: "",
          assignRoles: [],
        });
        // Don't use templates in edit mode
        setSelectedTemplate("");
      } else {
        form.reset({
          name: "",
          description: "",
          addUser: false,
          email: "",
          password: "",
          assignRoles: [],
        });
        // Set default template to custom in create mode
        setSelectedTemplate("custom");
      }
    } else {
      // Reset template selection when dialog is closed
      setSelectedTemplate("custom");
    }
  }, [isRoleDialogOpen, dialogMode, selectedRole, form]);

  // Fetch role permissions when a role is selected for permission management
  useEffect(() => {
    if (selectedRole && isPermissionsDialogOpen) {
      // Fetch permissions for the selected role
      const fetchRolePermissions = async () => {
        try {
          const response = await fetch(`/api/roles/${selectedRole.id}/permissions`);
          if (!response.ok) {
            throw new Error("Failed to fetch role permissions");
          }
          const data = await response.json();
          // Extract permission IDs
          setRolePermissions(data.map((p: any) => p.id));
        } catch (error) {
          console.error("Error fetching role permissions:", error);
          toast({
            title: "Error",
            description: "Failed to fetch role permissions",
            variant: "destructive",
          });
        }
      };

      fetchRolePermissions();
      
      if (permissions) {
        setAllPermissions(permissions);
      }
    }
  }, [selectedRole, isPermissionsDialogOpen, permissions, toast]);

  // Create Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleForm) => {
      // Extract user data if present
      const { addUser, email, password, assignRoles, ...roleData } = data;
      
      // Create the role
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      
      const createdRole = await response.json();
      
      // If user creation is enabled, create the user with this role
      if (addUser && email && password) {
        // Prepare role IDs - include both the created role and any additional roles selected
        const userRoles = [createdRole.id];
        if (assignRoles && assignRoles.length > 0) {
          userRoles.push(...assignRoles);
        }
        
        const userResponse = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            roles: userRoles, // Send multiple roles
            // Use email as username if not specified
            username: email.split('@')[0],
            status: 'active',
          }),
        });
        
        if (!userResponse.ok) {
          // Role was created but user creation failed
          const userError = await userResponse.json();
          toast({
            title: "Partial Success",
            description: `Role created but user creation failed: ${userError.message || "Unknown error"}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Role and user created successfully",
          });
        }
      }
      
      return createdRole;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      setIsRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      // Also invalidate users query if a user was created
      if (form.getValues("addUser")) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: RoleForm) => {
      const response = await fetch(`/api/roles/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      setIsRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete Role Mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add Permission to Role Mutation
  const addPermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number, permissionId: number }) => {
      const response = await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add permission");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permission added successfully",
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

  // Remove Permission from Role Mutation
  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number, permissionId: number }) => {
      const response = await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove permission");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permission removed successfully",
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

  // Handle template selection change
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = roleTemplates.find(t => t.value === value);
    
    if (template && value !== "custom") {
      form.setValue("name", template.label);
      form.setValue("description", template.description);
    } else if (value === "custom") {
      form.setValue("name", "");
      form.setValue("description", "");
    }
  };

  // Handle form submission
  const handleCreateRole = (data: RoleForm) => {
    createRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: RoleForm) => {
    updateRoleMutation.mutate(data);
  };

  // Handle permission toggling
  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    if (!selectedRole) return;
    
    if (checked) {
      // Add permission to role
      addPermissionMutation.mutate({ 
        roleId: selectedRole.id, 
        permissionId 
      }, {
        onSuccess: () => {
          setRolePermissions(prev => [...prev, permissionId]);
        }
      });
    } else {
      // Remove permission from role
      removePermissionMutation.mutate({ 
        roleId: selectedRole.id, 
        permissionId 
      }, {
        onSuccess: () => {
          setRolePermissions(prev => prev.filter(id => id !== permissionId));
        }
      });
    }
  };

  // Open the dialog for creating a new role
  const openCreateRoleDialog = () => {
    setDialogMode("create");
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  // Open the dialog for editing an existing role
  const openEditRoleDialog = (role: Role) => {
    setDialogMode("edit");
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  // Open the permission management dialog for a role
  const openPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsDialogOpen(true);
  };

  // Format the displayed date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 lg:p-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
            <p className="text-muted-foreground">
              Manage roles and assign permissions to control access to different parts of the system
            </p>
          </div>
        <Button onClick={openCreateRoleDialog} className="gap-2">
          <Plus size={16} /> Add Role
        </Button>
      </div>

      <Tabs defaultValue="roles" onValueChange={(value) => setCurrentTab(value as "roles" | "permissions")}>
        <TabsList className="mb-6">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Define roles that can be assigned to users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isRolesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : rolesError ? (
                <div className="text-center py-8 text-red-500">
                  Error loading roles. Please try again.
                </div>
              ) : roles && roles.length > 0 ? (
                <Table>
                  <TableCaption>List of all roles in the system</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield size={16} />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell>{role.description || "-"}</TableCell>
                        <TableCell>{formatDate(role.createdAt)}</TableCell>
                        <TableCell>{formatDate(role.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openPermissionsDialog(role)}
                              title="Manage Permissions"
                            >
                              <UserCheck size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditRoleDialog(role)}
                              title="Edit Role"
                            >
                              <Edit size={16} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-600"
                                  title="Delete Role"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete the role "{role.name}". This action cannot be undone.
                                    Users with this role will lose their permissions.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteRoleMutation.mutate(role.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {deleteRoleMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Delete"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No roles found. Create a new role to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>
                View available permissions that can be assigned to roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPermissionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : permissionsError ? (
                <div className="text-center py-8 text-red-500">
                  Error loading permissions. Please try again.
                </div>
              ) : permissions && permissions.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupPermissionsByResource(permissions)).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-2">
                      <h3 className="text-lg font-semibold capitalize">{resource}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resourcePermissions.map((permission) => (
                          <Card key={permission.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium capitalize">{permission.action}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {permission.description || `${permission.action} ${permission.resource}`}
                                </div>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {permission.action}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No permissions found in the system.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Creation/Editing Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New Role" : "Edit Role"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new role to the system"
                : "Update the role details"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                dialogMode === "create" ? handleCreateRole : handleUpdateRole
              )}
              className="space-y-4"
            >
              {dialogMode === "create" && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-base font-medium">Role Template</h3>
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Choose a template</SelectLabel>
                        {roleTemplates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select a predefined role or choose "Custom Role" to create your own
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Editor" 
                        {...field} 
                        disabled={dialogMode === "create" && selectedTemplate !== "custom" && selectedTemplate !== ""}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of the role as it will appear in the system
                    </FormDescription>
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
                      <Textarea
                        placeholder="e.g. Can edit content but not change system settings"
                        {...field}
                        value={field.value || ""}
                        disabled={dialogMode === "create" && selectedTemplate !== "custom" && selectedTemplate !== ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of what this role is for and what it can do
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                
                <FormField
                  control={form.control}
                  name="addUser"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4 mb-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Create User With This Role</FormLabel>
                        <FormDescription>
                          Toggle to create a new user with this role
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("addUser") && (
                  <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address for the new user
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => {
                        const [showPassword, setShowPassword] = useState(false);
                        return (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl className="flex-1">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="h-10 w-10"
                              >
                                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                            </div>
                            <FormDescription>
                              Create a secure password for the new user
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />

                    {/* Additional Roles Selection */}
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Additional Roles</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Select additional roles for this user
                      </p>
                      
                      <FormField
                        control={form.control}
                        name="assignRoles"
                        render={() => (
                          <FormItem className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                              {roles?.filter(role => dialogMode !== "edit" || role.id !== selectedRole?.id)
                                .map((role) => (
                                <FormField
                                  key={role.id}
                                  control={form.control}
                                  name="assignRoles"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={role.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded hover:bg-accent"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(role.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), role.id])
                                                : field.onChange(field.value?.filter((value) => value !== role.id) || [])
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">
                                            {role.name}
                                          </FormLabel>
                                          {role.description && (
                                            <p className="text-xs text-muted-foreground">
                                              {role.description}
                                            </p>
                                          )}
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createRoleMutation.isPending || updateRoleMutation.isPending
                  }
                >
                  {createRoleMutation.isPending || updateRoleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {dialogMode === "create" ? "Create Role" : "Update Role"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? `Manage Permissions: ${selectedRole.name}` : "Manage Permissions"}
            </DialogTitle>
            <DialogDescription>
              Assign or remove permissions for this role
            </DialogDescription>
          </DialogHeader>

          {selectedRole && permissions ? (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(groupPermissionsByResource(permissions)).map(([resource, resourcePermissions]) => (
                <div key={resource} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">{resource}</h3>
                    <Badge variant="outline">{resourcePermissions.length} permissions</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {resourcePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={rolePermissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(permission.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span className="capitalize">{permission.action}</span>
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {permission.description || `${permission.action} ${permission.resource}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}