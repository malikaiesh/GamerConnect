import { Link } from "wouter";
import { useState } from "react";
import { 
  UserPlus, 
  Users, 
  MessageCircle,
  ArrowLeft,
  Bell,
  Search,
  Send,
  UserCheck,
  Clock,
  Mail
} from "lucide-react";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type ActiveSection = "find-friends" | "friend-requests" | "messages";

interface TabItem {
  id: ActiveSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const tabs: TabItem[] = [
  {
    id: "find-friends",
    label: "Find Friends",
    icon: UserPlus
  },
  {
    id: "friend-requests", 
    label: "Requests",
    icon: Users,
    count: 2
  },
  {
    id: "messages",
    label: "Messages", 
    icon: MessageCircle,
    count: 5
  }
];

export function MobileSocial() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("find-friends");

  // Fetch real data from APIs
  const { data: friendsData } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/messages"],
  });

  const renderFindFriends = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for players..."
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white"
            data-testid="input-search-friends"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Suggested Friends</h3>
        {[1, 2, 3].map((user) => (
          <div key={user} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">U{user}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white">User {user}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Level {user * 5} • Online</div>
                </div>
              </div>
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                data-testid={`button-add-friend-${user}`}
              >
                Add Friend
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFriendRequests = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Friend Requests</h3>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">2 new</span>
      </div>
      
      {[1, 2].map((request) => (
        <div key={request} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">R{request}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">Request User {request}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  2 hours ago
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-full text-sm font-medium flex items-center justify-center"
              data-testid={`button-accept-${request}`}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Accept
            </button>
            <button 
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-full text-sm font-medium"
              data-testid={`button-decline-${request}`}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Messages</h3>
      
      {[1, 2, 3].map((message) => (
        <div key={message} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative">
                <span className="text-white font-bold">M{message}</span>
                {message === 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-white">Message User {message}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Hey, want to play a game?</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                  <Mail className="w-3 h-3 mr-1" />
                  {message === 1 ? "Just now" : `${message} minutes ago`}
                </div>
              </div>
            </div>
            <button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full"
              data-testid={`button-message-${message}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Link href="/user-dashboard">
            <button 
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Social</h1>
          <button 
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            data-testid="button-notifications"
          >
            <Bell className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-white/90 text-sm">
            Connect with friends and grow your gaming community
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs opacity-80">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs opacity-80">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs opacity-80">Messages</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl shadow-md p-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">{tab.label}</span>
                {tab.count && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-white text-purple-500" : "bg-red-500 text-white"
                  )}>
                    {tab.count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {activeSection === "find-friends" && renderFindFriends()}
        {activeSection === "friend-requests" && renderFriendRequests()}
        {activeSection === "messages" && renderMessages()}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}