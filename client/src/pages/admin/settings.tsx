import { AdminNavigation } from "@/components/admin/navigation";
import { GeneralSettings } from "@/components/admin/settings/general-settings";
import { SeoSettings } from "@/components/admin/settings/seo-settings";
import { AdsSettings } from "@/components/admin/settings/ads-settings";
import { PushNotifications } from "@/components/admin/settings/push-notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [location] = useLocation();
  
  // Extract tab from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["general", "seo", "ads", "notifications"].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);
  
  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your website settings</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="ads">Ads & Code</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4">
            <SeoSettings />
          </TabsContent>
          
          <TabsContent value="ads" className="space-y-4">
            <AdsSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <PushNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
