import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Upload, MoveUp, MoveDown, Users, Linkedin, Twitter, Github, Instagram, Facebook, Youtube } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TeamMember, insertTeamMemberSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SiTiktok } from "react-icons/si";
import { ObjectUploader } from "@/components/ObjectUploader";

import AdminNavigation from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Team member designations
const DESIGNATIONS = [
  "CEO (Chief Executive Officer)",
  "CTO (Chief Technology Officer)",
  "COO (Chief Operating Officer)",
  "Co founder",
  "Creative Director",
  "Project Manager",
  "Manager",
  "Supervisor",
  "Team Lead",
  "Game Developer",
  "Senior Game Developer",
  "Lead Game Developer",
  "Game Designer",
  "Level Designer",
  "Gameplay Programmer",
  "UI/UX Designer",
  "Graphic Designer",
  "3D Artist",
  "2D Artist",
  "Animation Artist",
  "Concept Artist",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "QA Engineer",
  "Technical Artist",
  "Marketing Manager",
  "Community Manager",
  "Business Analyst",
  "Content Creator",
  "Social Media Manager",
  "Game Tester"
];

type FormData = z.infer<typeof insertTeamMemberSchema>;

export default function TeamAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Get all team members
  const { data: members, isLoading, isError } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/all"],
  });

  // Form for create/edit
  const form = useForm<FormData>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: "",
      designation: "",
      profilePicture: "",
      bio: "",
      socialLinkedin: "",
      socialTwitter: "",
      socialGithub: "",
      socialInstagram: "",
      socialTiktok: "",
      socialFacebook: "",
      socialYoutube: "",
      displayOrder: 0,
      status: "active"
    }
  });

  // Profile picture upload functions
  const getUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      return {
        method: 'PUT' as const,
        url: response.uploadURL
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      toast({
        title: "Error",
        description: "Failed to get upload URL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful[0] && result.successful[0].uploadURL) {
      // Set the uploaded image URL to the form
      form.setValue('profilePicture', result.successful[0].uploadURL);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully"
      });
    }
  };

  // Create member mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/team", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Success",
        description: "Team member created successfully"
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create team member",
        variant: "destructive"
      });
    }
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/team/${id}`, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
      setEditDialogOpen(false);
      setSelectedMember(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive"
      });
    }
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Success",
        description: "Team member deleted successfully"
      });
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete team member",
        variant: "destructive"
      });
    }
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (teamMemberIds: number[]) =>
      apiRequest("PATCH", "/api/team/reorder", { teamMemberIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Success",
        description: "Team member order updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reorder team members",
        variant: "destructive"
      });
    }
  });

  const handleCreate = (data: FormData) => {
    console.log('Creating team member with data:', data);
    // Ensure required fields are present
    if (!data.name || !data.designation) {
      toast({
        title: "Validation Error",
        description: "Name and designation are required fields",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(data);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    form.reset({
      name: member.name,
      designation: member.designation,
      profilePicture: member.profilePicture || "",
      bio: member.bio || "",
      socialLinkedin: member.socialLinkedin || "",
      socialTwitter: member.socialTwitter || "",
      socialGithub: member.socialGithub || "",
      socialInstagram: member.socialInstagram || "",
      socialTiktok: (member as any).socialTiktok || "",
      socialFacebook: (member as any).socialFacebook || "",
      socialYoutube: (member as any).socialYoutube || "",
      displayOrder: member.displayOrder,
      status: member.status
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (!selectedMember) return;
    console.log('Updating team member with data:', data);
    updateMutation.mutate({ id: selectedMember.id, data });
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedMember) return;
    deleteMutation.mutate(selectedMember.id);
  };

  const moveUp = (index: number) => {
    if (!members || index === 0) return;
    const newOrder = [...members];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    const reorderedIds = newOrder.map(member => member.id);
    reorderMutation.mutate(reorderedIds);
  };

  const moveDown = (index: number) => {
    if (!members || index === members.length - 1) return;
    const newOrder = [...members];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const reorderedIds = newOrder.map(member => member.id);
    reorderMutation.mutate(reorderedIds);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="text-center text-red-500">Error loading team members</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Team Management
            </h1>
            <p className="text-muted-foreground">Manage your team members and their information</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              form.reset(); // Reset form when dialog closes
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-member">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-background to-muted/50">
              <DialogHeader className="pb-4 border-b border-border/50">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Add New Team Member
                </DialogTitle>
                <DialogDescription>
                  Add a new member to your team. Fill in their details below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-1">
                <Form {...form}>
                  <form id="create-team-member-form" onSubmit={form.handleSubmit(handleCreate)} className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="bg-card/50 rounded-lg p-4 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b border-border/30 pb-2">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field} 
                                  data-testid="input-name"
                                  className="focus:ring-2 focus:ring-primary/20" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="designation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Designation *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-designation" className="focus:ring-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Select designation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-48">
                                  {DESIGNATIONS.map((designation) => (
                                    <SelectItem key={designation} value={designation}>
                                      {designation}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Profile Picture</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                {/* Upload Button */}
                                <ObjectUploader
                                  maxNumberOfFiles={1}
                                  maxFileSize={5485760} // 5MB
                                  onGetUploadParameters={getUploadParameters}
                                  onComplete={handleUploadComplete}
                                  buttonClassName="w-full"
                                >
                                  <div className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    <span>Upload Profile Picture</span>
                                  </div>
                                </ObjectUploader>
                                
                                {/* Current Image Preview */}
                                {field.value && (
                                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <img 
                                      src={field.value} 
                                      alt="Profile preview" 
                                      className="w-12 h-12 object-cover rounded-full"
                                    />
                                    <div className="flex-1 text-sm">
                                      <p className="text-foreground">Profile picture uploaded</p>
                                      <p className="text-muted-foreground truncate">{field.value}</p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => form.setValue('profilePicture', '')}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Manual URL Input (as fallback) */}
                                <div className="space-y-2">
                                  <Input 
                                    placeholder="Or enter image URL manually" 
                                    {...field} 
                                    data-testid="input-profile-picture"
                                    className="focus:ring-2 focus:ring-primary/20"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Upload an image file or enter a URL manually (optional)
                                  </p>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description about the team member..."
                                {...field}
                                data-testid="textarea-bio"
                                className="min-h-20 resize-none focus:ring-2 focus:ring-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Social Media Links */}
                    <div className="bg-card/50 rounded-lg p-4 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b border-border/30 pb-2 flex items-center gap-2">
                        <span>Social Media Links</span>
                        <span className="text-xs text-muted-foreground font-normal">(All Optional)</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="socialLinkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Linkedin className="h-4 w-4 text-blue-600" />
                                LinkedIn
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://linkedin.com/in/username" 
                                  {...field} 
                                  data-testid="input-linkedin"
                                  className="focus:ring-2 focus:ring-blue-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialTwitter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Twitter className="h-4 w-4 text-blue-400" />
                                Twitter
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://twitter.com/username" 
                                  {...field} 
                                  data-testid="input-twitter"
                                  className="focus:ring-2 focus:ring-blue-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialGithub"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Github className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                                GitHub
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://github.com/username" 
                                  {...field} 
                                  data-testid="input-github"
                                  className="focus:ring-2 focus:ring-gray-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialInstagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-pink-600" />
                                Instagram
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://instagram.com/username" 
                                  {...field} 
                                  data-testid="input-instagram"
                                  className="focus:ring-2 focus:ring-pink-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialTiktok"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <SiTiktok className="h-4 w-4 text-black dark:text-white" />
                                TikTok
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://tiktok.com/@username" 
                                  {...field} 
                                  data-testid="input-tiktok"
                                  className="focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialFacebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Facebook className="h-4 w-4 text-blue-600" />
                                Facebook
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://facebook.com/username" 
                                  {...field} 
                                  data-testid="input-facebook"
                                  className="focus:ring-2 focus:ring-blue-600/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="socialYoutube"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-red-600" />
                                YouTube
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://youtube.com/@username" 
                                  {...field} 
                                  data-testid="input-youtube"
                                  className="focus:ring-2 focus:ring-red-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-status" className="focus:ring-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
              
              <DialogFooter className="pt-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="hover:bg-muted/80">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit"
                  form="create-team-member-form"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                  className="bg-primary hover:bg-primary/90 shadow-lg"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Member
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members?.length || 0} team member(s) total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!members || members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found. Add your first team member to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, index) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={member.profilePicture || ""} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell data-testid={`text-name-${member.id}`}>{member.name}</TableCell>
                      <TableCell data-testid={`text-designation-${member.id}`}>{member.designation}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} data-testid={`badge-status-${member.id}`}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveUp(index)}
                            disabled={index === 0 || reorderMutation.isPending}
                            data-testid={`button-move-up-${member.id}`}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveDown(index)}
                            disabled={index === members.length - 1 || reorderMutation.isPending}
                            data-testid={`button-move-down-${member.id}`}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            data-testid={`button-edit-${member.id}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(member)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-background to-muted/50">
            <DialogHeader className="pb-4 border-b border-border/50">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Pencil className="h-6 w-6 text-primary" />
                Edit Team Member
              </DialogTitle>
              <DialogDescription>
                Update the team member's information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6 py-4">
                  {/* Basic Information */}
                  <div className="bg-card/50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border/30 pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                className="focus:ring-2 focus:ring-primary/20" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Designation *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                                  <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-48">
                                {DESIGNATIONS.map((designation) => (
                                  <SelectItem key={designation} value={designation}>
                                    {designation}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Profile Picture</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {/* Upload Button */}
                              <ObjectUploader
                                maxNumberOfFiles={1}
                                maxFileSize={5485760} // 5MB
                                onGetUploadParameters={getUploadParameters}
                                onComplete={handleUploadComplete}
                                buttonClassName="w-full"
                              >
                                <div className="flex items-center gap-2">
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Profile Picture</span>
                                </div>
                              </ObjectUploader>
                              
                              {/* Current Image Preview */}
                              {field.value && (
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <img 
                                    src={field.value} 
                                    alt="Profile preview" 
                                    className="w-12 h-12 object-cover rounded-full"
                                  />
                                  <div className="flex-1 text-sm">
                                    <p className="text-foreground">Profile picture uploaded</p>
                                    <p className="text-muted-foreground truncate">{field.value}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => form.setValue('profilePicture', '')}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                              
                              {/* Manual URL Input (as fallback) */}
                              <div className="space-y-2">
                                <Input 
                                  placeholder="Or enter image URL manually" 
                                  {...field} 
                                  className="focus:ring-2 focus:ring-primary/20"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Upload an image file or enter a URL manually (optional)
                                </p>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description about the team member..."
                              {...field}
                              className="min-h-20 resize-none focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="bg-card/50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border/30 pb-2 flex items-center gap-2">
                      <span>Social Media Links</span>
                      <span className="text-xs text-muted-foreground font-normal">(All Optional)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialLinkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-blue-600" />
                              LinkedIn
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://linkedin.com/in/username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-blue-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialTwitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-blue-400" />
                              Twitter
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://twitter.com/username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-blue-400/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialGithub"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Github className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                              GitHub
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://github.com/username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-gray-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialInstagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Instagram className="h-4 w-4 text-pink-600" />
                              Instagram
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://instagram.com/username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-pink-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialTiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <SiTiktok className="h-4 w-4 text-black dark:text-white" />
                              TikTok
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://tiktok.com/@username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialFacebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Facebook className="h-4 w-4 text-blue-600" />
                              Facebook
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://facebook.com/username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-blue-600/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialYoutube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Youtube className="h-4 w-4 text-red-600" />
                              YouTube
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://youtube.com/@username" 
                                {...field} 
                                className="focus:ring-2 focus:ring-red-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </div>
            
            <DialogFooter className="pt-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="hover:bg-muted/80">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={form.handleSubmit(handleUpdate)}
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    Update Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedMember?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
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
    </div>
  );
}