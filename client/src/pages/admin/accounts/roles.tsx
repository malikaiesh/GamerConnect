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
                <CardTitle>System Roles</CardTitle>
                <CardDescription>
                  Roles determine what actions users can perform in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRolesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : roles && roles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || "—"}</TableCell>
                          <TableCell>{formatDate(role.createdAt)}</TableCell>
                          <TableCell>{formatDate(role.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPermissionsDialog(role)}
                                className="gap-1"
                              >
                                <Shield size={14} /> Permissions
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditRoleDialog(role)}
                                className="gap-1"
                              >
                                <Edit size={14} /> Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the "{role.name}" role? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRoleMutation.mutate(role.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
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
                  <div className="flex flex-col items-center justify-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground">No roles found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCreateRoleDialog}
                      className="mt-4 gap-2"
                    >
                      <Plus size={14} /> Create your first role
                    </Button>
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
                  These permissions can be assigned to roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPermissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : permissions && permissions.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupPermissionsByResource(permissions)).map(([resource, perms]) => (
                      <div key={resource} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-foreground capitalize">{resource}</h3>
                          <Badge variant="outline">{perms.length} permissions</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex p-2 rounded hover:bg-secondary/20"
                            >
                              <div className="space-y-1">
                                <div className="font-medium capitalize">{permission.action}</div>
                                <div className="text-sm text-muted-foreground">
                                  {permission.description || `Permission to ${permission.action} ${resource}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground">No permissions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" ? "Create New Role" : `Edit Role: ${selectedRole?.name}`}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === "create"
                  ? "Define a new role with specific permissions"
                  : "Update the role details"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(dialogMode === "create" ? handleCreateRole : handleUpdateRole)} className="space-y-6">
                {dialogMode === "create" && (
                  <div className="mb-6">
                    <FormLabel>Role Template</FormLabel>
                    <Select
                      value={selectedTemplate}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleTemplates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a predefined template or create a custom role
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
                        <Input placeholder="e.g. Content Editor" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for the role</FormDescription>
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
                          placeholder="Describe the role and its responsibilities"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Optional description of the role's purpose</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {dialogMode === "create" && (
                  <>
                    <div className="border p-4 rounded-lg border-border space-y-4">
                      <FormField
                        control={form.control}
                        name="addUser"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Create User with this Role</FormLabel>
                              <FormDescription>
                                Simultaneously create a user with this role
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("addUser") && (
                        <>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>User Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </>
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={createRoleMutation.isPending || updateRoleMutation.isPending}>
                    {(createRoleMutation.isPending || updateRoleMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {dialogMode === "create" ? "Create Role" : "Update Role"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Role Permissions Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield size={18} /> 
                Manage Permissions for {selectedRole?.name}
              </DialogTitle>
              <DialogDescription>
                Select the permissions for this role to control user access
              </DialogDescription>
            </DialogHeader>
            
            {allPermissions.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupPermissionsByResource(allPermissions)).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-foreground capitalize">{resource}</h3>
                      <Badge variant="outline">{resourcePermissions.length} permissions</Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resourcePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/20"
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={rolePermissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionToggle(permission.id, !!checked)}
                          />
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.action}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description || `Permission to ${permission.action} ${resource}`}
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
    </div>
  );
}