import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, PlusCircle, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { HomeAd } from "@shared/schema";

// Form schema for Home Ad
const homeAdFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  imageUrl: z.string().optional(),
  targetUrl: z.string().url({ message: "Must be a valid URL" }),
  status: z.string().min(1, { message: "Status is required" }),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

type HomeAdFormValues = z.infer<typeof homeAdFormSchema>;

export default function HomeAdsPage() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<HomeAd | null>(null);
  const [image, setImage] = useState<File | null>(null);

  // Query to fetch all home ads
  const { data: homeAds, isLoading } = useQuery({
    queryKey: ["/api/home-ads"],
    queryFn: async () => {
      const response = await fetch("/api/home-ads");
      if (!response.ok) {
        throw new Error("Failed to fetch home ads");
      }
      return response.json() as Promise<HomeAd[]>;
    },
  });

  // Form for adding new home ad
  const addForm = useForm<HomeAdFormValues>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      name: "",
      position: "",
      targetUrl: "",
      status: "active",
      startDate: null,
      endDate: null,
    },
  });

  // Form for editing existing home ad
  const editForm = useForm<HomeAdFormValues>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      name: "",
      position: "",
      targetUrl: "",
      status: "active",
      startDate: null,
      endDate: null,
    },
  });

  // Mutation for creating a new home ad
  const createMutation = useMutation({
    mutationFn: async (values: HomeAdFormValues) => {
      const formData = new FormData();
      
      // Add all form fields to formData
      formData.append("name", values.name);
      formData.append("position", values.position);
      formData.append("targetUrl", values.targetUrl);
      formData.append("status", values.status);
      
      if (values.startDate) {
        formData.append("startDate", values.startDate.toISOString());
      }
      
      if (values.endDate) {
        formData.append("endDate", values.endDate.toISOString());
      }
      
      // Add image if selected
      if (image) {
        formData.append("image", image);
      } else {
        throw new Error("Image is required");
      }
      
      const response = await fetch("/api/home-ads", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create home ad");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
      setIsAddOpen(false);
      addForm.reset();
      setImage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating an existing home ad
  const updateMutation = useMutation({
    mutationFn: async (values: HomeAdFormValues) => {
      if (!selectedAd) throw new Error("No ad selected");
      
      const formData = new FormData();
      
      // Add all form fields to formData
      formData.append("name", values.name);
      formData.append("position", values.position);
      formData.append("targetUrl", values.targetUrl);
      formData.append("status", values.status);
      
      if (values.startDate) {
        formData.append("startDate", values.startDate.toISOString());
      }
      
      if (values.endDate) {
        formData.append("endDate", values.endDate.toISOString());
      }
      
      // Add image if selected
      if (image) {
        formData.append("image", image);
      }
      
      const response = await fetch(`/api/home-ads/${selectedAd.id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update home ad");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
      setIsEditOpen(false);
      setSelectedAd(null);
      setImage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a home ad
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAd) throw new Error("No ad selected");
      
      const response = await apiRequest("DELETE", `/api/home-ads/${selectedAd.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete home ad");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
      setIsDeleteOpen(false);
      setSelectedAd(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = async (values: HomeAdFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = async (values: HomeAdFormValues) => {
    updateMutation.mutate(values);
  };

  const handleEditClick = (ad: HomeAd) => {
    setSelectedAd(ad);
    
    // Convert string dates to Date objects for the form
    const startDate = ad.startDate ? new Date(ad.startDate) : null;
    const endDate = ad.endDate ? new Date(ad.endDate) : null;
    
    editForm.reset({
      name: ad.name,
      position: ad.position,
      targetUrl: ad.targetUrl,
      status: ad.status,
      startDate,
      endDate,
    });
    
    setIsEditOpen(true);
  };

  const handleDeleteClick = (ad: HomeAd) => {
    setSelectedAd(ad);
    setIsDeleteOpen(true);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'above_featured':
        return 'Above Featured Games';
      case 'below_featured':
        return 'Below Featured Games';
      case 'above_popular':
        return 'Above Popular Games';
      case 'below_popular':
        return 'Below Popular Games';
      case 'above_about':
        return 'Above About Section';
      case 'below_about':
        return 'Below About Section';
      default:
        return position;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Home Ads</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Ad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Home Ads Management</CardTitle>
          <CardDescription>
            Manage ad banners that appear on the home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : homeAds && homeAds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.name}</TableCell>
                    <TableCell>{getPositionLabel(ad.position)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ad.status === "active" ? "default" : "secondary"}
                      >
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ad.impressionCount}</TableCell>
                    <TableCell>{ad.clickCount}</TableCell>
                    <TableCell>
                      {ad.impressionCount > 0
                        ? `${((ad.clickCount / ad.impressionCount) * 100).toFixed(2)}%`
                        : "0%"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(ad)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(ad)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No home ads found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddOpen(true)}
              >
                Create your first home ad
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Home Ad Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Home Ad</DialogTitle>
            <DialogDescription>
              Create a new advertisement to display on the home page
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ad name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="above_featured">Above Featured Games</SelectItem>
                        <SelectItem value="below_featured">Below Featured Games</SelectItem>
                        <SelectItem value="above_popular">Above Popular Games</SelectItem>
                        <SelectItem value="below_popular">Below Popular Games</SelectItem>
                        <SelectItem value="above_about">Above About Section</SelectItem>
                        <SelectItem value="below_about">Below About Section</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines where the ad will be displayed on the homepage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Image (Banner 728x90)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </FormControl>
                <FormDescription>
                  Upload a banner image (Recommended size: 728x90px)
                </FormDescription>
              </FormItem>

              <FormField
                control={addForm.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where users will be directed when they click the ad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the ad should start displaying
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the ad should stop displaying
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Ad
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Home Ad Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Home Ad</DialogTitle>
            <DialogDescription>
              Update the advertisement details
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ad name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="above_featured">Above Featured Games</SelectItem>
                        <SelectItem value="below_featured">Below Featured Games</SelectItem>
                        <SelectItem value="above_popular">Above Popular Games</SelectItem>
                        <SelectItem value="below_popular">Below Popular Games</SelectItem>
                        <SelectItem value="above_about">Above About Section</SelectItem>
                        <SelectItem value="below_about">Below About Section</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines where the ad will be displayed on the homepage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Image (Banner 728x90)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </FormControl>
                <FormDescription>
                  {selectedAd?.imageUrl ? (
                    <div className="flex flex-col gap-2">
                      <span>Current image:</span>
                      <img 
                        src={selectedAd.imageUrl} 
                        alt="Current banner" 
                        className="max-h-24 object-contain border rounded"
                      />
                      <span className="text-xs">Upload new image only if you want to replace the current one</span>
                    </div>
                  ) : (
                    "Upload a banner image (Recommended size: 728x90px)"
                  )}
                </FormDescription>
              </FormItem>

              <FormField
                control={editForm.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where users will be directed when they click the ad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the ad should start displaying
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the ad should stop displaying
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Ad
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this home ad? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}