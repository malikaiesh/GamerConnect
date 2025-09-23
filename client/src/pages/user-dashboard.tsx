import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Home, 
  GamepadIcon, 
  Users, 
  MessageCircle, 
  Settings, 
  Trophy, 
  Star,
  Shield,
  CreditCard,
  Gift,
  DollarSign,
  Target,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Heart,
  Copy,
  Share2,
  ExternalLink
} from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const { data: referralData } = useQuery({
    queryKey: ["/api/user/referrals"],
  });

  const services = [
    {
      title: "My Rooms",
      description: "Create and manage your gaming rooms",
      icon: Home,
      href: "/rooms/my-rooms",
      color: "bg-blue-500",
      count: userStats?.totalRooms || 0,
      countLabel: "Rooms"
    },
    {
      title: "Games Library",
      description: "Access thousands of games",
      icon: GamepadIcon,
      href: "/games",
      color: "bg-green-500",
      count: userStats?.gamesPlayed || 0,
      countLabel: "Played"
    },
    {
      title: "Friends",
      description: "Connect with other players",
      icon: Users,
      href: "/friends",
      color: "bg-purple-500",
      count: userStats?.totalFriends || 0,
      countLabel: "Friends"
    },
    {
      title: "Messages",
      description: "Chat with friends and contacts",
      icon: MessageCircle,
      href: "/messages",
      color: "bg-pink-500",
      count: userStats?.unreadMessages || 0,
      countLabel: "Unread"
    },
    {
      title: "Tournaments",
      description: "Join competitive gaming events",
      icon: Trophy,
      href: "/tournaments",
      color: "bg-yellow-500",
      count: userStats?.activeTournaments || 0,
      countLabel: "Active"
    },
    {
      title: "Profile Settings",
      description: "Manage your account preferences",
      icon: Settings,
      href: "/profile",
      color: "bg-gray-500",
      count: null,
      countLabel: null
    },
    {
      title: "Verification",
      description: "Get verified status badge",
      icon: Shield,
      href: "/verification",
      color: "bg-indigo-500",
      count: null,
      countLabel: user?.isVerified ? "Verified" : "Not Verified"
    },
    {
      title: "Pricing Plans",
      description: "Upgrade your gaming experience",
      icon: CreditCard,
      href: "/pricing-plans",
      color: "bg-orange-500",
      count: null,
      countLabel: null
    }
  ];

  const referralRewards = [
    {
      icon: Gift,
      title: "Welcome Bonus",
      description: "Earn $5 when friends sign up",
      reward: "$5.00",
      color: "text-green-600"
    },
    {
      icon: Target,
      title: "First Game Reward",
      description: "Extra $3 when they play first game",
      reward: "$3.00",
      color: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Profile Complete",
      description: "$2 bonus for completed profiles",
      reward: "$2.00",
      color: "text-purple-600"
    },
    {
      icon: Crown,
      title: "Premium Upgrade",
      description: "20% commission on premium signups",
      reward: "20%",
      color: "text-yellow-600"
    },
    {
      icon: Award,
      title: "10 Referrals Milestone",
      description: "Big $25 bonus for 10 referrals",
      reward: "$25.00",
      color: "text-red-600"
    },
    {
      icon: Zap,
      title: "Monthly Bonus",
      description: "Extra rewards for active referrers",
      reward: "Up to $50",
      color: "text-indigo-600"
    }
  ];

  const copyReferralLink = () => {
    if (user?.referralCode) {
      const referralLink = `${window.location.origin}/auth?ref=${user.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      // You can add a toast notification here
    }
  };

  const shareReferralLink = () => {
    if (user?.referralCode && navigator.share) {
      const referralLink = `${window.location.origin}/auth?ref=${user.referralCode}`;
      navigator.share({
        title: 'Join Gaming Portal',
        text: 'Join me on Gaming Portal and start earning rewards!',
        url: referralLink
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.displayName || user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Your gaming dashboard - manage everything from one place
              </p>
            </div>
            
            {user?.isVerified && (
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Verified Player
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Total Games Played</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.gamesPlayed || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Active Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalRooms || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalFriends || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralData?.totalReferrals || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Services Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Link key={index} href={service.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`service-card-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${service.color} text-white group-hover:scale-110 transition-transform`}>
                          <service.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{service.title}</CardTitle>
                          {service.count !== null && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-bold">{service.count}</span>
                              <span className="text-xs text-muted-foreground">{service.countLabel}</span>
                            </div>
                          )}
                          {service.countLabel && service.count === null && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {service.countLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Refer & Earn Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Refer & Earn</h2>
                <p className="text-muted-foreground">Invite friends and earn rewards for every successful referral</p>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-700 dark:text-green-300">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${((referralData?.totalEarnings || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">From {referralData?.totalReferrals || 0} referrals</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-700 dark:text-blue-300">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${((referralData?.monthlyEarnings || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{referralData?.monthlyReferrals || 0} new referrals</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-700 dark:text-purple-300">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {referralData?.conversionRate || '0'}%
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Success rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link */}
            {user?.referralCode && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Your Referral Link
                  </CardTitle>
                  <CardDescription>
                    Share this link with friends to start earning rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-sm">
                      {window.location.origin}/auth?ref={user.referralCode}
                    </div>
                    <Button onClick={copyReferralLink} variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                    {navigator.share && (
                      <Button onClick={shareReferralLink} variant="outline" size="icon">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href="/refer-earn">
                      <Button className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        View Full Refer & Earn Page
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reward Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Earning Opportunities
                </CardTitle>
                <CardDescription>
                  Multiple ways to earn rewards from your referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {referralRewards.map((reward, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-lg bg-muted ${reward.color}`}>
                        <reward.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{reward.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{reward.description}</p>
                        <div className={`text-lg font-bold ${reward.color}`}>
                          {reward.reward}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}