import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminHeader } from "@/components/admin/header";
import { AdminNavigation } from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, Plus, Trash, Edit, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";

// Form schema
const homeAdFormSchema = z.object({
  position: z.string().min(1, "Please select a position"),
  adCode: z.string().min(1, "Ad code is required"),
  status: z.string().min(1, "Please select a status"),
  isGoogleAd: z.boolean().default(false),
  adEnabled: z.boolean().default(true),
});

type HomeAdFormValues = z.infer<typeof homeAdFormSchema>;

// Home Ad positions
const AD_POSITIONS = [
  { value: "above_featured", label: "Above Featured Games (728x90)" },
  { value: "below_featured", label: "Below Featured Games (728x90)" },
  { value: "above_popular", label: "Above Popular Games (728x90)" },
  { value: "below_popular", label: "Below Popular Games (728x90)" },
  { value: "above_about", label: "Above About Section (728x90)" },
  { value: "below_about", label: "Below About Section (728x90)" },
];

export default function AdminHomeAdsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<HomeAd | null>(null);

  // Fetch all home ads
  const {
    data: homeAds = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/home-ads"],
    queryFn: async () => {
      const response = await fetch("/api/home-ads");
      if (!response.ok) {
        throw new Error("Failed to fetch home ads");
      }
      return response.json();
    }
  });

  // Add Home Ad Mutation
  const addMutation = useMutation({
    mutationFn: async (values: HomeAdFormValues) => {
      const res = await apiRequest("POST", "/api/home-ads", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ad Created",
        description: "The advertisement has been successfully created.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit Home Ad Mutation
  const editMutation = useMutation({
    mutationFn: async (values: HomeAdFormValues) => {
      if (!selectedAd) return null;
      const res = await apiRequest("PATCH", `/api/home-ads/${selectedAd.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ad Updated",
        description: "The advertisement has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setSelectedAd(null);
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete Home Ad Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/home-ads/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Ad Deleted",
        description: "The advertisement has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/home-ads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add form
  const addForm = useForm<HomeAdFormValues>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      position: "",
      adCode: "",
      status: "active",
      isGoogleAd: false,
      adEnabled: true,
    },
  });

  // Edit form
  const editForm = useForm<HomeAdFormValues>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      position: "",
      adCode: "",
      status: "active",
      isGoogleAd: false,
      adEnabled: true,
    },
  });

  // Form submission handlers
  const onAddSubmit = async (values: HomeAdFormValues) => {
    addMutation.mutate(values);
  };

  const onEditSubmit = async (values: HomeAdFormValues) => {
    editMutation.mutate(values);
  };

  // Handlers
  const handleEditClick = (ad: HomeAd) => {
    setSelectedAd(ad);
    editForm.reset({
      position: ad.position,
      adCode: ad.adCode,
      status: ad.status,
      isGoogleAd: ad.isGoogleAd || false,
      adEnabled: ad.adEnabled !== false, // If undefined, treat as true
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (ad: HomeAd) => {
    deleteMutation.mutate(ad.id);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Home Ads</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Ad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Advertisement</DialogTitle>
                  <DialogDescription>
                    Create a new advertisement to display on the home page.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
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
                              {AD_POSITIONS.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="adCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Code</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your ad code here"
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
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
                    <FormField
                      control={addForm.control}
                      name="isGoogleAd"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              This is a Google Ad
                            </FormLabel>
                            <FormDescription>
                              Check this if you're using Google AdSense code
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="adEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Ad Enabled
                            </FormLabel>
                            <FormDescription>
                              Uncheck to temporarily hide this ad without deleting it
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={addMutation.isPending}>
                        {addMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manage Home Page Advertisements</CardTitle>
              <CardDescription>
                Configure ads that will be displayed at different positions on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Failed to load home ads. Please try again.
                </div>
              ) : homeAds.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No advertisements found. Click "Add New Ad" to create one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeAds.map((ad: HomeAd) => {
                      // Calculate click-through rate
                      const ctr = ad.impressionCount > 0 
                        ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) 
                        : "0.00";
                      
                      // Find position label
                      const position = AD_POSITIONS.find(p => p.value === ad.position);
                      
                      return (
                        <TableRow key={ad.id}>
                          <TableCell>{position?.label || ad.position}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 mr-2 rounded-full ${ad.isGoogleAd ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                              {ad.isGoogleAd ? 'Google Ad' : 'Custom Ad'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 mr-2 rounded-full ${ad.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              {ad.status === 'active' ? 'Active' : 'Inactive'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 mr-2 rounded-full ${ad.adEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              {ad.adEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(ad.updatedAt || ad.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{ad.impressionCount.toLocaleString()}</TableCell>
                          <TableCell>{ad.clickCount.toLocaleString()}</TableCell>
                          <TableCell>{ctr}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => handleEditClick(ad)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="outline" className="text-red-500">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this advertisement? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => handleDeleteClick(ad)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Advertisement</DialogTitle>
                <DialogDescription>
                  Update the advertisement configuration.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AD_POSITIONS.map((position) => (
                              <SelectItem key={position.value} value={position.value}>
                                {position.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="adCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your ad code here"
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
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
                          value={field.value}
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
                  <FormField
                    control={editForm.control}
                    name="isGoogleAd"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Google Ad</FormLabel>
                          <FormDescription>
                            Check this if you're using Google AdSense or Ad Manager
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="adEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Ad</FormLabel>
                          <FormDescription>
                            Toggle to enable or disable this ad without deleting it
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={editMutation.isPending}>
                      {editMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

// HomeAd type definition
interface HomeAd {
  id: number;
  position: string;
  adCode: string;
  status: string;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
  updatedAt?: string;
  isGoogleAd?: boolean;
  adEnabled?: boolean;
}