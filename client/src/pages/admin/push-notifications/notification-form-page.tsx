import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, useRoute } from "wouter";
import { PushNotification, notificationTypeEnum } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Bell, PlayCircle } from "lucide-react";

// Animation variants for different notification types
const animationVariants = {
  toast: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
  },
  banner: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } }
  },
  modal: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  },
  "slide-in": {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  },
  "web-push": {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
  },
  alert: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
    exit: { opacity: 0, scale: 1.1, transition: { duration: 0.2 } }
  },
  survey: {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
  }
};
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extract the notification types from the enum
const notificationTypes = (notificationTypeEnum.enumValues as string[]).map(
  (type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
  })
);

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  type: z.enum(notificationTypeEnum.enumValues as [string, ...string[]]),
  image: z.string().url("Must be a valid URL").optional().nullable(),
  link: z.string().url("Must be a valid URL").optional().nullable(),
  active: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function NotificationFormPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = params?.id;
  const [isNewRoute] = useRoute("/admin/push-notifications/new");
  const [showPreview, setShowPreview] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previewPlayed, setPreviewPlayed] = useState(false);
  
  // Get the appropriate animation duration based on notification type
  const getAnimationDuration = (type: string) => {
    switch (type) {
      case 'modal':
      case 'survey':
        return 3500; // Longer for more complex animations
      case 'web-push':
      case 'alert':
        return 3000;
      default:
        return 2500; // Default is slightly quicker
    }
  };

  // Animation controls for the preview
  const playAnimation = () => {
    if (!isAnimating) {
      // First set to not played and animating
      setPreviewPlayed(false);
      setIsAnimating(true);
      
      // Reset animation after it completes with appropriate duration
      const duration = getAnimationDuration(notificationPreview.type);
      setTimeout(() => {
        setIsAnimating(false);
        setPreviewPlayed(true);
      }, duration);
    }
  };
  
  // Play animation automatically when preview tab is first shown
  useEffect(() => {
    if (showPreview && !previewPlayed && !isAnimating) {
      const timer = setTimeout(() => {
        playAnimation();
      }, 500); // Short delay to let the tab render first
      
      return () => clearTimeout(timer);
    }
  }, [showPreview, previewPlayed, isAnimating]);

  const isNew = isNewRoute || !id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "toast",
      image: "",
      link: "",
      active: false,
    },
  });

  // Fetch notification data if editing
  const { data: notification, isLoading: isLoadingNotification } = useQuery<PushNotification>({
    queryKey: [`/api/push-notifications/${id}`],
    enabled: !isNew && !!id,
  });

  // Set form values when notification data is loaded
  useEffect(() => {
    if (notification && !isNew) {
      form.reset({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        image: notification.image || "",
        link: notification.link || "",
        active: notification.active,
      });
    }
  }, [notification, form, isNew]);

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("POST", "/api/push-notifications", values);
    },
    onSuccess: () => {
      toast({
        title: "Notification created",
        description: "The notification has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications"] });
      setLocation("/admin/push-notifications");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error creating the notification.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("PUT", `/api/push-notifications/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Notification updated",
        description: "The notification has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/push-notifications/${id}`] });
      setLocation("/admin/push-notifications");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating the notification.",
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

  const notificationPreview = form.watch();

  return (
    <AdminLayout
      title={isNew ? "Create Notification" : "Edit Notification"}
      description={isNew ? "Create a new push notification" : "Edit an existing push notification"}
    >
      {isLoadingNotification && !isNew ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="form">Notification Form</TabsTrigger>
            <TabsTrigger 
              value="preview" 
              onClick={() => {
                setShowPreview(true);
                setPreviewPlayed(false);
                setIsAnimating(false);
              }}
            >
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {notificationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of notification to display.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Whether the notification is currently active and visible to users.
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

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/push-notifications")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isNew ? "Create Notification" : "Update Notification"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            {showPreview && (
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preview</h3>
                  <Card className="p-6 relative overflow-hidden min-h-[300px]">
                    {/* Play Animation Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-4 right-4 z-10 flex items-center gap-1"
                      onClick={playAnimation}
                      disabled={isAnimating}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {isAnimating ? "Playing..." : previewPlayed ? "Replay Animation" : "Play Animation"}
                    </Button>
                    
                    {/* Animated Notification */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={isAnimating ? "animating" : "static"}
                        initial={isAnimating ? "hidden" : "visible"}
                        animate="visible"
                        exit="exit"
                        variants={animationVariants[notificationPreview.type as keyof typeof animationVariants] || animationVariants.toast}
                        className={`rounded-lg border ${
                          notificationPreview.type === "toast" 
                            ? "bg-white dark:bg-gray-800" 
                            : notificationPreview.type === "banner"
                            ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800"
                            : notificationPreview.type === "modal"
                            ? "bg-white dark:bg-gray-800 shadow-lg"
                            : notificationPreview.type === "web-push"
                            ? "bg-white dark:bg-gray-800 shadow-lg"
                            : notificationPreview.type === "slide-in"
                            ? "bg-white dark:bg-gray-800 border-l-4 border-l-primary"
                            : notificationPreview.type === "alert"
                            ? "bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-800"
                            : notificationPreview.type === "survey"
                            ? "bg-white dark:bg-gray-800 shadow-lg border-t-4 border-t-primary"
                            : "bg-white dark:bg-gray-800"
                        }`}>
                        <div className="p-4">
                          <div className="flex items-start">
                            <Bell className="h-5 w-5 text-primary mr-2 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">
                                {notificationPreview.title || "Notification Title"}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {notificationPreview.message || "Notification message will appear here."}
                              </p>
                              
                              {notificationPreview.image && (
                                <img 
                                  src={notificationPreview.image} 
                                  alt="Notification image" 
                                  className="mt-3 rounded-md w-full max-h-48 object-cover"
                                />
                              )}
                              
                              <div className="flex justify-end mt-4 gap-2">
                                <Button variant="outline" size="sm">Dismiss</Button>
                                {notificationPreview.link && (
                                  <Button size="sm">View Details</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="capitalize">
                        {notificationPreview.type || "toast"}
                      </Badge>
                    </div>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Details</h3>
                  <Card className="p-6">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                        <dd className="mt-1 capitalize">{notificationPreview.type || "toast"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="mt-1">
                          <Badge variant={notificationPreview.active ? "default" : "secondary"}>
                            {notificationPreview.active ? "Active" : "Inactive"}
                          </Badge>
                        </dd>
                      </div>
                      {notificationPreview.link && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Link</dt>
                          <dd className="mt-1 text-sm break-all">
                            <a href={notificationPreview.link} target="_blank" rel="noopener noreferrer" 
                              className="text-blue-500 hover:underline">
                              {notificationPreview.link}
                            </a>
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Actions Available
                        </dt>
                        <dd className="mt-1">
                          {notificationPreview.link ? "Dismiss, View Details" : "Dismiss only"}
                        </dd>
                      </div>
                      
                      {notificationPreview.type === "web-push" && (
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md mt-4">
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Web push notifications require user permission and will appear 
                            outside the browser. This preview is an approximation.
                          </p>
                        </div>
                      )}
                    </dl>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AdminLayout>
  );
}