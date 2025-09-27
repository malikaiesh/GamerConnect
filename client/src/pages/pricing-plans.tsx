import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, Gem, Shield, Home, Crown, Sparkles, Trophy, TrendingUp, Fire } from "lucide-react";
import type { PricingPlan } from "@shared/schema";

const planIcons = {
  diamonds: Gem,
  verification: Shield,
  room_creation: Home,
  premium_features: Crown
};

const planTypeLabels = {
  diamonds: "Diamonds",
  verification: "Verification",  
  room_creation: "Room Creation",
  premium_features: "Premium Features"
};

const categoryIcons = {
  all: Sparkles,
  diamonds: Gem,
  verification: Shield,
  room_creation: Home,
  premium_features: Crown
};

export default function PricingPlansPage() {
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch all active pricing plans
  const { data: allPlans = [], isLoading } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing-plans/public'],
  });

  const handlePurchase = (plan: PricingPlan) => {
    // Redirect to checkout or payment page
    window.location.href = `/checkout?plan=${plan.id}`;
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const filteredPlans = selectedType === "all" 
    ? allPlans 
    : allPlans.filter(plan => plan.planType === selectedType);

  const planTypes = ["all", ...Array.from(new Set(allPlans.map(plan => plan.planType)))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden" style={{
        background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}>
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 text-white leading-tight">
              Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Perfect Plan</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 px-4">
              Unlock premium features, get verified, and enhance your gaming experience with our flexible pricing plans.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-6 sm:py-8 lg:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Loading pricing plans...</p>
            </div>
          ) : (
            <>
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="heading-md">Pricing Plans</h2>
                </div>
                <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType} className="mb-6">
                  <TabsList className="grid grid-cols-5 w-full bg-card/50 border border-border/50 rounded-lg p-1">
                    {planTypes.map(type => {
                      const IconComponent = categoryIcons[type as keyof typeof categoryIcons] || Sparkles;
                      return (
                        <TabsTrigger 
                          key={type}
                          value={type}
                          className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                        >
                          <IconComponent className="h-4 w-4" />
                          {type === "all" ? "All" : planTypeLabels[type as keyof typeof planTypeLabels]?.split(' ')[0] || type}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <h2 className="heading-md">Pricing Plans</h2>
                
                {/* Plan Category Tabs on the right side */}
                <div className="flex items-center gap-4">
                  <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
                    <TabsList className="grid grid-cols-5 bg-card/50 border border-border/50 rounded-lg p-1">
                      {planTypes.map(type => {
                        const IconComponent = categoryIcons[type as keyof typeof categoryIcons] || Sparkles;
                        return (
                          <TabsTrigger 
                            key={type}
                            value={type}
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                          >
                            <IconComponent className="h-4 w-4" />
                            {type === "all" ? "All" : planTypeLabels[type as keyof typeof planTypeLabels] || type}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Plans Grid */}
              {filteredPlans.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-muted-foreground text-base sm:text-lg">No plans available for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredPlans.map((plan) => {
                    const IconComponent = planIcons[plan.planType as keyof typeof planIcons] || Star;
                    
                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] sm:hover:scale-105 ${
                          plan.isPopular ? 'border-primary ring-2 ring-primary/20' : ''
                        }`}
                        data-testid={`plan-${plan.name}`}
                      >
                        {plan.isPopular && (
                          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                            ⭐ Most Popular
                          </div>
                        )}
                        
                        <CardHeader className={`text-center ${plan.isPopular ? 'pt-8' : 'pt-4 sm:pt-6'} px-4 sm:px-6`}>
                          <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold leading-tight">{plan.displayName}</CardTitle>
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              {plan.originalPrice && plan.originalPrice > plan.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(plan.originalPrice, plan.currency)}
                                </span>
                              )}
                              <span className="text-2xl sm:text-3xl font-bold text-primary">
                                {formatPrice(plan.price, plan.currency)}
                              </span>
                            </div>
                            {plan.shortDescription && (
                              <p className="text-sm text-muted-foreground">{plan.shortDescription}</p>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                          {plan.description && (
                            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                          )}
                          
                          {/* Plan-specific details */}
                          <div className="space-y-2 mb-4">
                            {plan.diamondAmount && (
                              <div className="flex items-center gap-2">
                                <Gem className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">{plan.diamondAmount} Diamonds</span>
                              </div>
                            )}
                            {plan.verificationDuration && (
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">{plan.verificationDuration} days verification</span>
                              </div>
                            )}
                            {plan.roomCreationLimit && (
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{plan.roomCreationLimit} rooms</span>
                              </div>
                            )}
                          </div>

                          {plan.features && plan.features.length > 0 && (
                            <div className="space-y-2 mb-6">
                              {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <Button 
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={() => handlePurchase(plan)}
                            data-testid={`purchase-${plan.name}`}
                          >
                            {plan.planType === 'verification' ? 'Get Verified' : 'Purchase Now'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}