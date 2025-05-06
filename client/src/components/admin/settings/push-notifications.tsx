import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PushNotification, notificationTypeEnum } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Eye, Trash2, Plus, MessageSquare } from "lucide-react";

// Define the form schema using zod
const notificationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  image: z.string().url({ message: "Image must be a valid URL" }).optional().nullable(),
  link: z.string().url({ message: "Link must be a valid URL" }).optional().nullable(),
  type: z.enum(["alert", "banner", "modal", "slide-in", "toast"]),
  active: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export function PushNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<PushNotification | null>(null);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<PushNotification[]>({
    queryKey: ['/api/notifications'],
  });

  // Initialize form with selected notification data or defaults
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: selectedNotification
      ? {
          ...selectedNotification,
        }
      : {
          title: "",
          message: "",
          image: "",
          link: "",
          type: "toast" as const,
          active: true,
        },
    values: selectedNotification
      ? {
          ...selectedNotification,
          image: selectedNotification.image || "",
          link: selectedNotification.link || "",
        }
      : undefined,
  });

  // Create/update notification mutation
  const mutation = useMutation({
    mutationFn: async (values: NotificationFormValues) => {
      if (selectedNotification && !isCreateMode) {
        return apiRequest("PUT", `/api/notifications/${selectedNotification.id}`, values);
      } else {
        return apiRequest("POST", "/api/notifications", values);
      }
    },
    onSuccess: () => {
      toast({
        title: isCreateMode ? "Notification created" : "Notification updated",
        description: isCreateMode 
          ? "The notification has been created successfully."
          : "The notification has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (isCreateMode) {
        resetForm();
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

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/notifications/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setNotificationToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: NotificationFormValues) => {
    mutation.mutate(values);
  };

  const resetForm = () => {
    form.reset({
      title: "",
      message: "",
      image: "",
      link: "",
      type: "toast",
      active: true,
    });
    setSelectedNotification(null);
    setIsCreateMode(false);
  };

  const handleEditNotification = (notification: PushNotification) => {
    setSelectedNotification(notification);
    setIsCreateMode(false);
  };

  const handleCreateNotification = () => {
    resetForm();
    setIsCreateMode(true);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Notifications List</TabsTrigger>
          <TabsTrigger value="form" onClick={() => setIsCreateMode(true)}>
            {isCreateMode || !selectedNotification ? "Create Notification" : "Edit Notification"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Push Notifications</h2>
            <Button onClick={handleCreateNotification}>
              <Plus className="h-4 w-4 mr-2" /> Add Notification
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Active</TableHead>
                    <TableHead className="hidden md:table-cell">Impressions</TableHead>
                    <TableHead className="hidden md:table-cell">Clicks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No notifications found. Create your first one!
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            <span className="truncate max-w-[150px]">{notification.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize">
                          {notification.type}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className={`h-2.5 w-2.5 rounded-full ${notification.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {notification.impressionCount}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {notification.clickCount}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditNotification(notification)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              handleEditNotification(notification);
                              handlePreview();
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog open={notificationToDelete?.id === notification.id} onOpenChange={(open) => !open && setNotificationToDelete(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setNotificationToDelete(notification)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Notification</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{notification.title}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setNotificationToDelete(null)}>Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => deleteMutation.mutate(notification.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="form" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreateMode ? "Create New Notification" : "Edit Notification"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Title</FormLabel>
                          <FormControl>
                            <Input placeholder="New Game Added!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select notification type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="toast">Toast (Bottom right)</SelectItem>
                              <SelectItem value="alert">Alert (Top center)</SelectItem>
                              <SelectItem value="banner">Banner (Top full width)</SelectItem>
                              <SelectItem value="modal">Modal (Center screen)</SelectItem>
                              <SelectItem value="slide-in">Slide-in (Top right)</SelectItem>
                            </SelectContent>
                          </Select>
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
                            placeholder="Check out our newest game with amazing graphics and gameplay!"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Image to display with the notification
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
                          <FormLabel>Action Link (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/game/123" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Where to send users when they click the notification
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
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this notification
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-700"
                            onClick={() => form.setValue("active", !field.value)}>
                            <span aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                field.value ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCreateMode ? "Create Notification" : "Update Notification"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handlePreview}>
                      Preview
                    </Button>
                    {!isCreateMode && (
                      <Button type="button" variant="ghost" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification Preview */}
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notification Preview</DialogTitle>
              <DialogDescription>
                This is how your notification will appear to users.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className={`
                bg-card rounded-lg shadow-lg p-4 flex items-start
                ${form.watch("type") === "banner" ? "w-full" : "max-w-sm"}
                ${form.watch("type") === "modal" ? "mx-auto" : ""}
              `}>
                {form.watch("image") && (
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={form.watch("image") || ""} 
                      alt="Notification" 
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm">{form.watch("title")}</h4>
                  <p className="text-muted-foreground text-xs mb-2">{form.watch("message")}</p>
                  <div className="flex space-x-2">
                    {form.watch("link") && (
                      <Button size="sm" variant="default" className="text-xs py-1 h-auto">
                        Check it Out
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs py-1 h-auto">
                      Dismiss
                    </Button>
                  </div>
                </div>
                <button className="ml-2 text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
