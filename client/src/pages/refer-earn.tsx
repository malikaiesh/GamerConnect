import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { 
  Gift, 
  DollarSign, 
  Users, 
  Award, 
  Target, 
  TrendingUp,
  Star,
  Crown,
  Zap,
  Heart
} from 'lucide-react';

export default function ReferEarnPage() {
  // Fetch available referral offers/settings
  const { data: offers, isLoading } = useQuery({
    queryKey: ['/api/referrals/public/offers'],
    queryFn: () => apiRequest('/api/referrals/public/offers')
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const offerCards = [
    {
      icon: Gift,
      title: 'Welcome Bonus',
      description: 'Earn instantly when your friends sign up',
      reward: offers?.registration_reward || 500,
      color: 'text-green-600'
    },
    {
      icon: Target,
      title: 'First Game Reward',
      description: 'Bonus when friends play their first game',
      reward: offers?.first_game_reward || 300,
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'Profile Complete',
      description: 'Extra reward for completed profiles',
      reward: offers?.profile_complete_reward || 200,
      color: 'text-purple-600'
    },
    {
      icon: Award,
      title: '10 Referrals Milestone',
      description: 'Big bonus for reaching 10 referrals',
      reward: offers?.milestone_10_reward || 1000,
      color: 'text-orange-600'
    },
    {
      icon: Crown,
      title: '50 Referrals Milestone',
      description: 'Huge bonus for 50 successful referrals',
      reward: offers?.milestone_50_reward || 7500,
      color: 'text-yellow-600'
    },
    {
      icon: Star,
      title: '100 Referrals Milestone',
      description: 'Ultimate reward for top performers',
      reward: offers?.milestone_100_reward || 20000,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Refer & Earn Rewards
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Invite friends to join our gaming platform and earn amazing rewards. The more you refer, the more you earn!
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Multi-Tier</div>
              <div className="text-sm text-muted-foreground">Commission System</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Level 1 Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50%</div>
              <div className="text-sm text-muted-foreground">Level 2 Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">25%</div>
              <div className="text-sm text-muted-foreground">Level 3 Rewards</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Invite Friends</h3>
              <p className="text-muted-foreground">Share your referral link with friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Friends Join</h3>
              <p className="text-muted-foreground">When they sign up using your link, you both get rewarded</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-muted-foreground">Get paid for every action your referrals take</p>
            </div>
          </div>
        </div>

        {/* Reward Offers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Available Rewards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerCards.map((offer, index) => {
              const Icon = offer.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className={`h-6 w-6 ${offer.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <div className={`text-2xl font-bold ${offer.color}`}>
                          {formatCurrency(offer.reward)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join our referral program today and start earning rewards for sharing your favorite gaming platform with friends.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" className="px-8" data-testid="button-get-started">
                  <Target className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="px-8" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How do I get paid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rewards are automatically added to your account balance. You can request a payout once you reach the minimum threshold of $10.00.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>When do I receive rewards?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Most rewards are credited instantly when your referrals complete the required actions. Some rewards may take up to 24 hours to process.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Is there a limit to how much I can earn?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There's no limit! The more friends you refer, the more you can earn. Our top referrers earn hundreds of dollars every month.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}