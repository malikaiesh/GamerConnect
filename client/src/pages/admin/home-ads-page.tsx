import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/layout/admin-layout";
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
  adCode: z.string().min(1, "Ad code is required when using Google Ad").or(z.literal("")),
  imageUrl: z.string().url("Image URL must be a valid URL").or(z.literal("")),
  targetUrl: z.string().url("Target URL must be a valid URL").or(z.literal("")),
  status: z.string().min(1, "Status is required"),
  isGoogleAd: z.boolean().optional().default(false),
  adEnabled: z.boolean().optional().default(true),
})
.refine(
  (data) => {
    // If it's Google Ad, adCode is required
    if (data.isGoogleAd) {
      return !!data.adCode;
    }
    // If not Google Ad, either imageUrl+targetUrl or adCode must be provided
    return (!!data.imageUrl && !!data.targetUrl) || !!data.adCode;
  },
  {
    message: "Either provide Ad Code or both Image URL and Target URL",
    path: ["adCode"],
  }
);

// Position options for home ads
const AD_POSITIONS = [
  "above_featured",
  "below_featured",
  "above_popular",
  "below_popular",
  "above_about",
  "below_about",
];

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
      const allEnabled = homeAds.every((ad: HomeAd) => ad.adEnabled !== false);
      setAllAdsEnabled(allEnabled);
    }
  }, [homeAds]);

  const onAddSubmit = async (values: z.infer<typeof homeAdFormSchema>) => {
    addMutation.mutate(values);
  };

  const onEditSubmit = async (values: z.infer<typeof homeAdFormSchema>) => {
    updateMutation.mutate(values);
  };

  const handleToggleAd = (id: number, currentStatus: boolean) => {
    toggleAdMutation.mutate({ id, adEnabled: !currentStatus });
  };

  const handleToggleAllAds = () => {
    toggleAllAdsMutation.mutate(!allAdsEnabled);
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
    if (window.confirm(`Are you sure you want to delete ${ad.name}?`)) {
      deleteMutation.mutate(ad.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
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
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Home Ad</DialogTitle>
                  <DialogDescription>
                    Create a new ad to display on the homepage
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Featured Games Promotion"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A name to help you identify this ad
                          </FormDescription>
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
                              {AD_POSITIONS.map((pos) => (
                                <SelectItem key={pos} value={pos}>
                                  {pos.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
                    <FormField
                      control={addForm.control}
                      name="adCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Code (HTML/JS){addForm.watch("isGoogleAd") && " *"}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={addForm.watch("isGoogleAd") 
                                ? "Paste Google AdSense code here" 
                                : "Paste ad code here or provide Image URL and Target URL below"}
                              {...field}
                              rows={6}
                            />
                          </FormControl>
                          <FormDescription>
                            {addForm.watch("isGoogleAd") 
                              ? "Paste the Google AdSense code (required for Google Ads)"
                              : "Paste the HTML or JavaScript code for your ad"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {!addForm.watch("isGoogleAd") && (
                      <>
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
                                URL of the image for this ad
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
                                URL where users will be sent when they click on the ad
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
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
                    <DialogFooter>
                      <Button type="submit" disabled={addMutation.isPending}>
                        {addMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Ad"
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
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400 text-center">
            Error loading home ads: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        ) : homeAds.length === 0 ? (
          <div className="bg-muted p-8 rounded-md text-center">
            <p className="text-muted-foreground mb-4">No home ads found</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first ad
            </Button>
          </div>
        ) : (
          <div className="bg-background rounded-md border shadow-sm">
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
                        {ad.isGoogleAd ? (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                            Google Ad
                          </span>
                        ) : ad.imageUrl ? (
                          <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs dark:bg-purple-900/30 dark:text-purple-400">
                            Banner
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs dark:bg-amber-900/30 dark:text-amber-400">
                            HTML/JS
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleAd(ad.id, ad.adEnabled)}
                          className={ad.adEnabled ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                        >
                          {ad.adEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </Button>
                      </TableCell>
                      <TableCell>{ad.impressionCount.toLocaleString()}</TableCell>
                      <TableCell>{ad.clickCount.toLocaleString()}</TableCell>
                      <TableCell>{ctr}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
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
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {ad.targetUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Home Ad</DialogTitle>
            <DialogDescription>
              Update the properties of this ad
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Featured Games Promotion"
                        {...field}
                      />
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
                        {AD_POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
              <FormField
                control={editForm.control}
                name="adCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Code (HTML/JS){editForm.watch("isGoogleAd") && " *"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={editForm.watch("isGoogleAd") 
                          ? "Paste Google AdSense code here" 
                          : "Paste ad code here or provide Image URL and Target URL below"}
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      {editForm.watch("isGoogleAd") 
                        ? "Paste the Google AdSense code (required for Google Ads)"
                        : "Paste the HTML or JavaScript code for your ad"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!editForm.watch("isGoogleAd") && (
                <>
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
                          URL of the image for this ad
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
                          URL where users will be sent when they click on the ad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
    </AdminLayout>
  );
}