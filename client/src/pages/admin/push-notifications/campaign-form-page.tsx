import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, useRoute } from "wouter";
import { PushCampaign } from "@shared/schema";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Bell, Info, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  image: z.string().url("Must be a valid URL").optional().nullable(),
  link: z.string().url("Must be a valid URL").optional().nullable(),
  actionYes: z.string().optional().nullable(),
  actionNo: z.string().optional().nullable(),
  notificationType: z.string().default("toast"),
  isWebPush: z.boolean().default(false),
  // Web Push specific fields
  requireInteraction: z.boolean().default(false),
  badge: z.string().url("Must be a valid URL").optional().nullable(),
  icon: z.string().url("Must be a valid URL").optional().nullable(),
  vibrate: z.string().optional().nullable(),
  isSurvey: z.boolean().default(false),
  targetAll: z.boolean().default(true),
  targetFilters: z.record(z.unknown()).default({}),
  scheduleDate: z.date().optional().nullable(),
  status: z.string().default("draft"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CampaignFormPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = params?.id;
  const [isNewRoute] = useRoute("/admin/push-notifications/campaigns/new");
  const [showPreview, setShowPreview] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const isNew = isNewRoute || !id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      message: "",
      image: "",
      link: "",
      actionYes: "",
      actionNo: "",
      isSurvey: false,
      targetAll: true,
      targetFilters: {},
      scheduleDate: null,
      status: "draft",
    },
  });

  // Update the scheduleDate when the date changes
  useEffect(() => {
    if (date) {
      form.setValue("scheduleDate", date);
    } else {
      form.setValue("scheduleDate", null);
    }
  }, [date, form]);

  // Fetch campaign data if editing
  const { data: campaign, isLoading: isLoadingCampaign } = useQuery<PushCampaign>({
    queryKey: [`/api/push-notifications/campaigns/${id}`],
    enabled: !isNew && !!id,
  });

  // Set form values when campaign data is loaded
  useEffect(() => {
    if (campaign && !isNew) {
      form.reset({
        name: campaign.name,
        title: campaign.title,
        message: campaign.message,
        image: campaign.image || "",
        link: campaign.link || "",
        actionYes: campaign.actionYes || "",
        actionNo: campaign.actionNo || "",
        isSurvey: campaign.isSurvey || false,
        targetAll: campaign.targetAll || false,
        targetFilters: campaign.targetFilters || {},
        scheduleDate: campaign.scheduleDate ? new Date(campaign.scheduleDate) : null,
        status: campaign.status,
      });

      if (campaign.scheduleDate) {
        setDate(new Date(campaign.scheduleDate));
      }
    }
  }, [campaign, form, isNew]);

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("POST", "/api/push-notifications/campaigns", values);
    },
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "The campaign has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/campaigns"] });
      setLocation("/admin/push-notifications/campaigns");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error creating the campaign.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("PUT", `/api/push-notifications/campaigns/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Campaign updated",
        description: "The campaign has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/campaigns"] });
      queryClient.invalidateQueries({ queryKey: [`/api/push-notifications/campaigns/${id}`] });
      setLocation("/admin/push-notifications/campaigns");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating the campaign.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isNew) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const campaignPreview = form.watch();

  return (
    <AdminLayout
      title={isNew ? "Create Campaign" : "Edit Campaign"}
      description={isNew ? "Create a new push notification campaign" : "Edit an existing push notification campaign"}
    >
      {isLoadingCampaign && !isNew ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Notification Content</TabsTrigger>
            <TabsTrigger value="targeting">Targeting & Schedule</TabsTrigger>
            <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>Preview</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The internal name for this campaign (not shown to users).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={
                            field.value === "draft"
                              ? "outline"
                              : field.value === "scheduled"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {field.value.charAt(0).toUpperCase() + field.value.slice(1)}
                        </Badge>
                        <div className="ml-2 text-sm text-muted-foreground">
                          {field.value === "draft" 
                            ? "This campaign is in draft mode and hasn't been sent yet." 
                            : field.value === "scheduled" 
                            ? "This campaign is scheduled to be sent at the specified date and time." 
                            : "This campaign has been sent."}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSurvey"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Survey Campaign</FormLabel>
                        <FormDescription>
                          Enable if this campaign is meant to collect user feedback through Yes/No responses.
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
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter notification title" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title that will appear in the notification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notification message"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of the notification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional image to display with the notification.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/page"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional link to navigate to when clicked.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("isSurvey") && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="actionYes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yes Button Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Yes"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Text for the positive response button.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="actionNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No Button Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="No"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Text for the negative response button.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="targeting" className="space-y-6">
                <FormField
                  control={form.control}
                  name="targetAll"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Send to All Subscribers</FormLabel>
                        <FormDescription>
                          Target all active subscribers or use specific filtering criteria.
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

                {!form.watch("targetAll") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-4 w-4" />
                        Targeting Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md p-4 mb-4">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                          Targeting options will be available in a future update. Currently, all notifications are sent to all subscribers when you enable targeting.
                        </p>
                      </div>
                      
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Device Type</label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Desktop</Badge>
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Mobile</Badge>
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Tablet</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Browser</label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Chrome</Badge>
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Firefox</Badge>
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Safari</Badge>
                            <Badge variant="outline" className="cursor-not-allowed opacity-50">Edge</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-3">Schedule Campaign</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="scheduleDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-3">
                          <FormDescription className="mt-0">
                            Choose a date and time for this campaign to be sent. Leave blank to send immediately.
                          </FormDescription>
                          
                          <div className="flex items-center gap-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-[240px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            
                            <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                              Clear
                            </Button>
                          </div>
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                {showPreview && (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Preview</h3>
                      <Card className="p-6 relative overflow-hidden">
                        <div className="p-4 bg-white dark:bg-gray-800 border shadow-lg rounded-lg">
                          <div className="flex items-start">
                            <Bell className="h-5 w-5 text-primary mr-2 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">
                                {campaignPreview.title || "Notification Title"}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {campaignPreview.message || "Notification message will appear here."}
                              </p>
                              
                              {campaignPreview.image && (
                                <img 
                                  src={campaignPreview.image} 
                                  alt="Notification image" 
                                  className="mt-3 rounded-md w-full max-h-48 object-cover"
                                />
                              )}
                              
                              <div className="flex justify-end mt-4 gap-2">
                                {campaignPreview.isSurvey ? (
                                  <>
                                    <Button variant="outline" size="sm">
                                      {campaignPreview.actionNo || "No"}
                                    </Button>
                                    <Button size="sm">
                                      {campaignPreview.actionYes || "Yes"}
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button variant="outline" size="sm">Dismiss</Button>
                                    {campaignPreview.link && (
                                      <Button size="sm">View Details</Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
                      <Card className="p-6">
                        <dl className="space-y-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Name</dt>
                            <dd className="mt-1">{campaignPreview.name || "Untitled Campaign"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                            <dd className="mt-1">
                              <Badge variant={campaignPreview.status === "draft" ? "outline" : "default"}>
                                {campaignPreview.status.charAt(0).toUpperCase() + campaignPreview.status.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</dt>
                            <dd className="mt-1">
                              {campaignPreview.targetAll 
                                ? "All Subscribers" 
                                : "Filtered Subscribers (targeting options coming soon)"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled For</dt>
                            <dd className="mt-1">
                              {campaignPreview.scheduleDate 
                                ? format(campaignPreview.scheduleDate, "PPP 'at' p") 
                                : "Not scheduled (will send immediately)"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Type</dt>
                            <dd className="mt-1">
                              {campaignPreview.isSurvey 
                                ? "Survey (collects user responses)" 
                                : campaignPreview.link
                                ? "Content (includes link)"
                                : "Announcement (no link)"}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/push-notifications/campaigns")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? "Create Campaign" : "Update Campaign"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      )}
    </AdminLayout>
  );
}