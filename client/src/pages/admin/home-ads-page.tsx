import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminNavigation from "@/components/admin/navigation";
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
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Home Ads</h1>
            <p className="text-muted-foreground">Manage advertisements displayed on your homepage</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleToggleAllAds}
              className={`${allAdsEnabled ? 'bg-primary/10 hover:bg-primary/20' : 'bg-destructive/10 hover:bg-destructive/20'}`}
              disabled={toggleAllAdsMutation.isPending || homeAds.length === 0}
            >
              {toggleAllAdsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : allAdsEnabled ? (
                <>
                  <ToggleRight className="mr-2 h-4 w-4 text-primary" />
                  All Ads ON
                </>
              ) : (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4 text-destructive" />
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
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Home Ad</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Ad Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Featured Games Promotion"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Position</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Force the dropdown to close properly
                              setTimeout(() => document.body.click(), 100);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue className="text-foreground" placeholder="Select a position" />
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
                          <FormDescription className="text-muted-foreground">
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
                            <FormLabel className="text-foreground">Google Ad</FormLabel>
                            <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Ad Code (HTML/JS){addForm.watch("isGoogleAd") && " *"}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={addForm.watch("isGoogleAd") 
                                ? "Paste Google AdSense code here" 
                                : "Paste ad code here or provide Image URL and Target URL below"}
                              {...field}
                              rows={6}
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
                              <FormLabel className="text-foreground">Image URL (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/ad-image.jpg"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-muted-foreground">
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
                              <FormLabel className="text-foreground">Target URL (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/landing-page"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Status</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Force the dropdown to close properly
                              setTimeout(() => document.body.click(), 100);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue className="text-foreground" placeholder="Select a status" />
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
          <div className="bg-destructive/10 p-4 rounded-md text-destructive text-center">
            Error loading home ads: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        ) : homeAds.length === 0 ? (
          <div className="bg-card border border-border p-8 rounded-md text-center">
            <p className="text-muted-foreground mb-4">No home ads found</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first ad
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-md shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Position</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Ad Enabled</TableHead>
                  <TableHead className="text-foreground">Impressions</TableHead>
                  <TableHead className="text-foreground">Clicks</TableHead>
                  <TableHead className="text-foreground">CTR</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeAds.map((ad: HomeAd) => {
                  const ctr = ad.impressionCount > 0
                    ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                    : "0.00";
                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="text-foreground">{ad.name}</TableCell>
                      <TableCell className="text-foreground">
                        {ad.position.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </TableCell>
                      <TableCell>
                        {ad.isGoogleAd ? (
                          <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                            Google Ad
                          </span>
                        ) : ad.imageUrl ? (
                          <span className="px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs">
                            Banner
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                            HTML/JS
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.status === "active"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleAd(ad.id, ad.adEnabled)}
                          className={ad.adEnabled ? "text-primary" : "text-destructive"}
                        >
                          {ad.adEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-foreground">{ad.impressionCount.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground">{ad.clickCount.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground">{ctr}%</TableCell>
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
                            className="text-destructive hover:text-destructive/80"
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
                                className="text-primary hover:text-primary/80"
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Home Ad</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Force the dropdown to close properly
                        setTimeout(() => document.body.click(), 100);
                      }}
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
                      <FormLabel className="text-foreground">Google Ad</FormLabel>
                      <FormDescription className="text-muted-foreground">
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
                    <FormLabel className="text-foreground">Ad Code (HTML/JS){editForm.watch("isGoogleAd") && " *"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={editForm.watch("isGoogleAd") 
                          ? "Paste Google AdSense code here" 
                          : "Paste ad code here or provide Image URL and Target URL below"}
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground">
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
                        <FormLabel className="text-foreground">Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/ad-image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
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
                        <FormLabel className="text-foreground">Target URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/landing-page"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
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
                    <FormLabel className="text-foreground">Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Force the dropdown to close properly
                        setTimeout(() => document.body.click(), 100);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue className="text-foreground" placeholder="Select a status" />
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
    </div>
  );
}