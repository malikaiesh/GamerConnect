import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminNavigation from "@/components/admin/navigation";
import AdminHeader from "@/components/admin/header";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for adding home ads
const homeAdFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  adCode: z.string().optional(),
  imageUrl: z.string().optional(),
  targetUrl: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  isGoogleAd: z.boolean().optional().default(false),
  adEnabled: z.boolean().optional().default(true),
});

// Position options for home ads
const AD_POSITIONS = [
  "above_featured_games",
  "below_featured_games",
  "above_popular_games",
  "below_popular_games",
  "above_about_section",
  "below_about_section",
];

export default function HomeAdsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<number | null>(null);
  const [allAdsEnabled, setAllAdsEnabled] = useState(true);
  const { toast } = useToast();

  // Form for adding home ads
  const addForm = useForm<z.infer<typeof homeAdFormSchema>>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      name: "",
      position: "",
      adCode: "",
      imageUrl: "",
      targetUrl: "",
      status: "active",
      isGoogleAd: false,
      adEnabled: true,
    },
  });

  // Form for editing home ads
  const editForm = useForm<z.infer<typeof homeAdFormSchema>>({
    resolver: zodResolver(homeAdFormSchema),
    defaultValues: {
      name: "",
      position: "",
      adCode: "",
      imageUrl: "",
      targetUrl: "",
      status: "active",
      isGoogleAd: false,
      adEnabled: true,
    },
  });

  // Mutation for adding home ads
  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof homeAdFormSchema>) => {
      const res = await apiRequest("POST", "/api/home-ads", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad added successfully",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
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

  // Mutation for updating home ads
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof homeAdFormSchema>) => {
      const res = await apiRequest(
        "PUT",
        `/api/home-ads/${currentAdId}`,
        values
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad updated successfully",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
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

  // Mutation for toggling ad enabled status
  const toggleAdMutation = useMutation({
    mutationFn: async ({
      id,
      adEnabled,
    }: {
      id: number;
      adEnabled: boolean;
    }) => {
      const res = await apiRequest("PATCH", `/api/home-ads/${id}`, {
        adEnabled,
      });
      return await res.json();
    },
    onSuccess: () => {
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

  // Mutation for toggling all ads at once
  const toggleAllAdsMutation = useMutation({
    mutationFn: async (adEnabled: boolean) => {
      const res = await apiRequest("POST", "/api/home-ads/toggle-all", {
        adEnabled,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All ads status updated successfully",
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

  // Mutation for deleting home ads
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/home-ads/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete home ad");
      }
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Home ad deleted successfully",
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

  // Fetch all home ads
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/home-ads"],
    queryFn: async () => {
      const response = await fetch("/api/home-ads");
      if (!response.ok) {
        throw new Error("Failed to fetch home ads");
      }
      return await response.json();
    },
  });
  
  // Extract the ads array from the response
  const homeAds = data?.ads || [];
  
  // Update allAdsEnabled state based on fetched data
  useEffect(() => {
    if (homeAds.length > 0) {
      const allEnabled = homeAds.every(ad => ad.adEnabled !== false);
      setAllAdsEnabled(allEnabled);
    }
  }, [homeAds]);

  const onAddSubmit = async (values: z.infer<typeof homeAdFormSchema>) => {
    addMutation.mutate(values);
  };

  const onEditSubmit = async (values: z.infer<typeof homeAdFormSchema>) => {
    updateMutation.mutate(values);
  };

  const handleEditClick = (ad: HomeAd) => {
    setCurrentAdId(ad.id);
    editForm.reset({
      name: ad.name,
      position: ad.position,
      adCode: ad.adCode || "",
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl || "",
      status: ad.status,
      isGoogleAd: ad.isGoogleAd,
      adEnabled: ad.adEnabled,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (ad: HomeAd) => {
    deleteMutation.mutate(ad.id);
  };
  
  // Toggle all ads at once
  const handleToggleAllAds = () => {
    setAllAdsEnabled(!allAdsEnabled);
    toggleAllAdsMutation.mutate(!allAdsEnabled);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Home Ads</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleToggleAllAds}
                className={`${allAdsEnabled ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30' : 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30'}`}
                disabled={toggleAllAdsMutation.isPending || homeAds.length === 0}
              >
                {toggleAllAdsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : allAdsEnabled ? (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                    All Ads ON
                  </>
                ) : (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                    All Ads OFF
                  </>
                )}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Ad
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Advertisement</DialogTitle>
                  <DialogDescription>
                    Create a new advertisement to display on the home page.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)}>
                    <div className="space-y-4 mb-4">
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Ad Name" {...field} />
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
                                  <SelectValue placeholder="Select a position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AD_POSITIONS.map((position) => (
                                  <SelectItem key={position} value={position}>
                                    {position.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Where this ad will appear on the homepage
                            </FormDescription>
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
                              <FormLabel>Google Ad</FormLabel>
                              <FormDescription>
                                Check this if this is a Google AdSense ad
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      {!addForm.watch("isGoogleAd") && (
                        <>
                          <FormField
                            control={addForm.control}
                            name="adCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ad Code (HTML/JS)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Paste ad code here"
                                    {...field}
                                    rows={6}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Paste the HTML or JavaScript code for your ad
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/ad-image.jpg"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  If you're using an image for the ad
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="targetUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/landing-page"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Where the ad should link to when clicked
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
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
                              <FormLabel>Enabled</FormLabel>
                              <FormDescription>
                                Enable or disable this ad
                              </FormDescription>
                            </div>
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
                                  <SelectValue placeholder="Select a status" />
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
                    <DialogFooter>
                      <Button type="submit" disabled={addMutation.isPending}>
                        {addMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Ad"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading home ads: {(error as Error).message}
            </div>
          ) : homeAds.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No home ads found. Add your first ad to get started.
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ad Enabled</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeAds.map((ad: HomeAd) => {
                    const ctr = ad.impressionCount > 0
                      ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                      : "0.00";
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>{ad.name}</TableCell>
                        <TableCell>
                          {ad.position.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                        </TableCell>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto text-sm"
                              onClick={() => toggleAdMutation.mutate({ id: ad.id, adEnabled: !ad.adEnabled })}
                              disabled={toggleAdMutation.isPending}
                            >
                              {ad.adEnabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{ad.impressionCount.toLocaleString()}</TableCell>
                        <TableCell>{ad.clickCount.toLocaleString()}</TableCell>
                        <TableCell>{ctr}%</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(ad)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(ad)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Advertisement</DialogTitle>
                <DialogDescription>
                  Edit existing advertisement details.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                  <div className="space-y-4 mb-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ad Name" {...field} />
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AD_POSITIONS.map((position) => (
                                <SelectItem key={position} value={position}>
                                  {position.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where this ad will appear on the homepage
                          </FormDescription>
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
                              Check this if this is a Google AdSense ad
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {!editForm.watch("isGoogleAd") && (
                      <>
                        <FormField
                          control={editForm.control}
                          name="adCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ad Code (HTML/JS)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Paste ad code here"
                                  {...field}
                                  rows={6}
                                />
                              </FormControl>
                              <FormDescription>
                                Paste the HTML or JavaScript code for your ad
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/ad-image.jpg"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                If you're using an image for the ad
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
                              <FormLabel>Target URL (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/landing-page"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Where the ad should link to when clicked
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
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
                            <FormLabel>Enabled</FormLabel>
                            <FormDescription>
                              Enable or disable this ad
                            </FormDescription>
                          </div>
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
                                <SelectValue placeholder="Select a status" />
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
                  <DialogFooter>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Ad"
                      )}
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
  name: string;
  imageUrl?: string;
  targetUrl?: string;
  isGoogleAd: boolean;
  adEnabled: boolean;
  createdAt: string;
}