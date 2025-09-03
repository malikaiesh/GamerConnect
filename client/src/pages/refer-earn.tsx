import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
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
  const { user, isAuthenticated } = useAuth();
  
  // Fetch available referral offers/settings
  const { data: offers, isLoading } = useQuery({
    queryKey: ['/api/referrals/public/offers'],
    queryFn: () => apiRequest('/api/referrals/public/offers')
  });

  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Referral Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-primary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-secondary/30 rounded-full bg-secondary/10 text-secondary text-sm font-medium tracking-wide">
              EARN REWARDS
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-foreground font-extrabold">
              Refer & Earn Rewards
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed mb-6">
              Invite friends to join our gaming platform and earn amazing rewards. The more you refer, the more you earn!
            </p>
            {/* Commission Tiers Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8">
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shadow-secondary/5">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Multi-Tier</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Commission System</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shadow-secondary/5">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">100%</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Level 1 Rewards</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shadow-secondary/5">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">50%</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Level 2 Rewards</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shadow-secondary/5">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600">25%</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Level 3 Rewards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
                HOW IT WORKS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
                Start Earning in 3 Easy Steps
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Invite Friends</h3>
                <p className="text-muted-foreground leading-relaxed">Share your referral link with friends and family</p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Friends Join</h3>
                <p className="text-muted-foreground leading-relaxed">When they sign up using your link, you both get rewarded</p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-300">
                    <DollarSign className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Earn Rewards</h3>
                <p className="text-muted-foreground leading-relaxed">Get paid for every action your referrals take</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reward Offers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1 border border-green-500/30 rounded-full bg-green-500/10 text-green-600 text-sm font-medium tracking-wide">
                REWARD OFFERS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600 mb-4">
                Available Rewards
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Earn money for every successful referral and milestone you achieve
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {offerCards.map((offer, index) => {
                const Icon = offer.icon;
                return (
                  <Card key={index} className="relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-muted/30 border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="pb-3 relative">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-br ${
                          index % 3 === 0 ? 'from-green-500/20 to-green-600/20' :
                          index % 3 === 1 ? 'from-blue-500/20 to-blue-600/20' : 
                          'from-purple-500/20 to-purple-600/20'
                        } rounded-xl shadow-lg`}>
                          <Icon className={`h-7 w-7 ${offer.color}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-foreground">{offer.title}</CardTitle>
                          <div className={`text-2xl font-bold ${offer.color} mt-1`}>
                            {formatCurrency(offer.reward)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {offer.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-2xl backdrop-blur-sm">
                <CardContent className="pt-8 pb-8">
                  <div className="inline-block mb-4 px-4 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
                    GET STARTED
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
                    Ready to Start Earning?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Join our referral program today and start earning rewards for sharing your favorite gaming platform with friends.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {isAuthenticated ? (
                      <Link href="/admin/dashboard">
                        <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-get-started">
                          <Target className="mr-2 h-5 w-5" />
                          Go to Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth">
                        <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-get-started">
                          <Target className="mr-2 h-5 w-5" />
                          Get Started
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-3 text-lg border-2 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-300" 
                      onClick={scrollToFAQ}
                      data-testid="button-learn-more"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <div id="faq-section" className="mt-16">
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
      </main>
      <Footer />
    </div>
  );
}