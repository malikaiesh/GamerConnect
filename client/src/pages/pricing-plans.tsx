import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, Gem, Shield, Home, Crown } from "lucide-react";
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
      <section className="relative py-16 overflow-hidden" style={{
        background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}>
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-xl mb-4 text-white">
              Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Perfect Plan</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Unlock premium features, get verified, and enhance your gaming experience with our flexible pricing plans.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading pricing plans...</p>
            </div>
          ) : (
            <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
              <div className="mb-8">
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
                  {planTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="capitalize">
                      {type === "all" ? "All Plans" : planTypeLabels[type as keyof typeof planTypeLabels] || type}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={selectedType}>
                {filteredPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No plans available for this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlans.map((plan) => {
                      const IconComponent = planIcons[plan.planType as keyof typeof planIcons] || Star;
                      
                      return (
                        <Card 
                          key={plan.id} 
                          className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${
                            plan.isPopular ? 'border-primary ring-2 ring-primary/20' : ''
                          }`}
                          data-testid={`plan-${plan.name}`}
                        >
                          {plan.isPopular && (
                            <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                              ⭐ Most Popular
                            </div>
                          )}
                          
                          <CardHeader className={`text-center ${plan.isPopular ? 'pt-8' : 'pt-6'}`}>
                            <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10">
                              <IconComponent className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold">{plan.displayName}</CardTitle>
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-2">
                                {plan.originalPrice && plan.originalPrice > plan.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(plan.originalPrice, plan.currency)}
                                  </span>
                                )}
                                <span className="text-3xl font-bold text-primary">
                                  {formatPrice(plan.price, plan.currency)}
                                </span>
                              </div>
                              {plan.shortDescription && (
                                <p className="text-sm text-muted-foreground">{plan.shortDescription}</p>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent>
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
                              className="w-full"
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
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
}