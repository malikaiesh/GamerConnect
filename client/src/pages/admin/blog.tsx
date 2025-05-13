import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminNavigation from "@/components/admin/navigation";
import { PostsList } from "@/components/admin/blog/posts-list";
import { BlogForm } from "@/components/admin/blog/blog-form";
import { BlogInternalLinks } from "@/components/admin/blog/blog-internal-links";
import { BlogPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LinkIcon } from "lucide-react";

export default function AdminBlog() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  
  // Handle editing a post
  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsCreateMode(false);
    if (activeTab !== "form") {
      setActiveTab("form");
    }
  };
  
  // Handle adding a new post
  const handleAddPost = () => {
    setSelectedPost(null);
    setIsCreateMode(true);
    setActiveTab("form");
  };
  
  // Handle form submission success
  const handleFormSuccess = () => {
    if (isCreateMode) {
      setSelectedPost(null);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          
          <Button onClick={handleAddPost}>
            <Plus className="mr-2 h-4 w-4" /> Add New Post
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Blog Posts</TabsTrigger>
            <TabsTrigger value="form">
              {isCreateMode ? "Add New Post" : "Edit Post"}
            </TabsTrigger>
            <TabsTrigger value="internal-links">
              <LinkIcon className="mr-2 h-4 w-4" />
              Internal Links
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <PostsList
              onEditPost={handleEditPost}
              onAddPost={handleAddPost}
            />
          </TabsContent>
          
          <TabsContent value="form" className="space-y-4">
            <BlogForm
              post={selectedPost || undefined}
              onSuccess={handleFormSuccess}
            />
          </TabsContent>
          
          <TabsContent value="internal-links" className="space-y-4">
            <BlogInternalLinks />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
