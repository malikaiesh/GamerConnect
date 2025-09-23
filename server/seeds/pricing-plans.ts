import { db } from "@db";
import { pricingPlans, type InsertPricingPlan } from "@shared/schema";
import { eq } from "drizzle-orm";

const suggestedPricingPlans: Omit<InsertPricingPlan, 'createdBy' | 'updatedBy'>[] = [
  // Diamond Plans
  {
    name: "diamonds-50",
    displayName: "50 Diamonds",
    planType: "diamonds",
    duration: "one_time",
    price: 199, // $1.99
    currency: "USD",
    diamondAmount: 50,
    sortOrder: 1,
    status: "active",
    shortDescription: "Perfect starter pack",
    description: "Get 50 diamonds to enhance your gaming experience. Perfect for new users who want to try premium features.",
    features: ["50 Diamonds", "Instant Delivery", "24/7 Support"],
    metadata: {
      color: "#3B82F6",
      badge: "Starter",
      icon: "gem",
      category: "basic"
    }
  },
  {
    name: "diamonds-100",
    displayName: "100 Diamonds",
    planType: "diamonds",
    duration: "one_time",
    price: 349, // $3.49
    currency: "USD",
    originalPrice: 399, // $3.99 (showing discount)
    diamondAmount: 100,
    sortOrder: 2,
    status: "active",
    isPopular: true,
    shortDescription: "Most popular choice",
    description: "Get 100 diamonds with a special discount. Our most popular diamond package for regular players.",
    features: ["100 Diamonds", "12% Bonus Discount", "Instant Delivery", "Priority Support"],
    metadata: {
      color: "#10B981",
      badge: "Popular",
      icon: "gem",
      category: "popular"
    }
  },
  {
    name: "diamonds-500",
    displayName: "500 Diamonds",
    planType: "diamonds",
    duration: "one_time",
    price: 1499, // $14.99
    currency: "USD",
    originalPrice: 1749, // $17.49
    diamondAmount: 500,
    sortOrder: 3,
    status: "active",
    shortDescription: "Great value pack",
    description: "Best value for money! Get 500 diamonds with an amazing discount for serious gamers.",
    features: ["500 Diamonds", "25% Bonus Diamonds", "Instant Delivery", "VIP Support", "Exclusive Badge"],
    metadata: {
      color: "#8B5CF6",
      badge: "Best Value",
      icon: "gem",
      category: "value"
    }
  },
  {
    name: "diamonds-1000",
    displayName: "1000 Diamonds",
    planType: "diamonds",
    duration: "one_time",
    price: 2799, // $27.99
    currency: "USD",
    originalPrice: 3499, // $34.99
    diamondAmount: 1000,
    sortOrder: 4,
    status: "active",
    shortDescription: "Ultimate power pack",
    description: "Maximum diamonds for ultimate gaming power. Perfect for professional players and content creators.",
    features: ["1000 Diamonds", "40% Bonus Diamonds", "Instant Delivery", "VIP Support", "Exclusive Avatar", "Monthly Rewards"],
    metadata: {
      color: "#F59E0B",
      badge: "Ultimate",
      icon: "gem",
      category: "premium"
    }
  },

  // Verification Plans
  {
    name: "verification-1-month",
    displayName: "1 Month Verification",
    planType: "verification",
    duration: "monthly",
    price: 499, // $4.99
    currency: "USD",
    verificationDuration: 30,
    sortOrder: 10,
    status: "active",
    shortDescription: "Try premium verification",
    description: "Get verified for 1 month with a blue checkmark badge. Stand out in rooms and build trust.",
    features: ["Blue Verification Badge", "Priority Room Access", "Special Chat Colors", "Exclusive Emojis", "Profile Boost"],
    metadata: {
      color: "#3B82F6",
      badge: "Monthly",
      icon: "crown",
      category: "verification"
    }
  },
  {
    name: "verification-6-months",
    displayName: "6 Months Verification",
    planType: "verification",
    duration: "6_months",
    price: 2399, // $23.99
    currency: "USD",
    originalPrice: 2994, // $29.94 (20% savings)
    verificationDuration: 180,
    sortOrder: 11,
    status: "active",
    isPopular: true,
    shortDescription: "Most popular verification",
    description: "6 months of verification with 20% savings. Perfect balance of value and duration.",
    features: ["Blue Verification Badge", "Priority Room Access", "Special Chat Colors", "Exclusive Emojis", "Profile Boost", "20% Savings"],
    metadata: {
      color: "#10B981",
      badge: "Popular",
      icon: "crown",
      category: "verification"
    }
  },
  {
    name: "verification-1-year",
    displayName: "1 Year Verification",
    planType: "verification",
    duration: "yearly",
    price: 3999, // $39.99
    currency: "USD",
    originalPrice: 5988, // $59.88 (33% savings)
    verificationDuration: 365,
    sortOrder: 12,
    status: "active",
    shortDescription: "Best value verification",
    description: "Full year of verification with maximum savings. Best choice for dedicated users.",
    features: ["Blue Verification Badge", "Priority Room Access", "Special Chat Colors", "Exclusive Emojis", "Profile Boost", "33% Savings", "Yearly Rewards"],
    metadata: {
      color: "#F59E0B",
      badge: "Best Value",
      icon: "crown",
      category: "verification"
    }
  },

  // Room Creation Plans
  {
    name: "room-premium-pack",
    displayName: "Premium Room Pack",
    planType: "room_creation",
    duration: "one_time",
    price: 799, // $7.99
    currency: "USD",
    roomCreationLimit: 5,
    sortOrder: 20,
    status: "active",
    shortDescription: "Create up to 5 premium rooms",
    description: "Unlock the ability to create 5 premium rooms with advanced features and customization options.",
    features: ["5 Premium Rooms", "Custom Room Themes", "Advanced Settings", "Room Analytics", "Priority Support"],
    metadata: {
      color: "#8B5CF6",
      badge: "Premium",
      icon: "map-pin",
      category: "rooms"
    }
  },
  {
    name: "room-unlimited",
    displayName: "Unlimited Rooms",
    planType: "room_creation",
    duration: "monthly",
    price: 1499, // $14.99/month
    currency: "USD",
    roomCreationLimit: 999, // Practically unlimited
    sortOrder: 21,
    status: "active",
    isPopular: true,
    shortDescription: "Create unlimited rooms",
    description: "Create unlimited rooms with all premium features. Perfect for community leaders and content creators.",
    features: ["Unlimited Rooms", "All Premium Features", "Custom Branding", "Advanced Analytics", "Priority Support", "API Access"],
    metadata: {
      color: "#DC2626",
      badge: "Unlimited",
      icon: "map-pin",
      category: "rooms"
    }
  },

  // Premium Features Plans
  {
    name: "premium-monthly",
    displayName: "Premium Monthly",
    planType: "premium_features",
    duration: "monthly",
    price: 999, // $9.99
    currency: "USD",
    sortOrder: 30,
    status: "active",
    shortDescription: "All premium features monthly",
    description: "Access all premium features with monthly flexibility. Cancel anytime.",
    features: ["All Premium Features", "Priority Support", "Exclusive Content", "Advanced Customization", "No Ads"],
    metadata: {
      color: "#6366F1",
      badge: "Premium",
      icon: "star",
      category: "premium"
    }
  },
  {
    name: "premium-yearly",
    displayName: "Premium Yearly",
    planType: "premium_features",
    duration: "yearly",
    price: 9999, // $99.99
    currency: "USD",
    originalPrice: 11988, // $119.88 (17% savings)
    sortOrder: 31,
    status: "active",
    isPopular: true,
    shortDescription: "Best premium value",
    description: "Full year of premium features with 17% savings. Best value for premium experience.",
    features: ["All Premium Features", "Priority Support", "Exclusive Content", "Advanced Customization", "No Ads", "17% Savings", "Bonus Features"],
    metadata: {
      color: "#F59E0B",
      badge: "Best Value",
      icon: "star",
      category: "premium"
    }
  }
];

export async function seedPricingPlans() {
  try {
    // Check if pricing plans already exist
    const existingPlans = await db.select().from(pricingPlans).limit(1);
    
    if (existingPlans.length > 0) {
      console.log('ℹ️  Pricing plans already exist, skipping seeding');
      return;
    }

    // Create admin user reference (assuming admin user with ID 1 exists)
    const plansWithUser = suggestedPricingPlans.map(plan => ({
      ...plan,
      createdBy: 1,
      updatedBy: 1
    }));

    await db.insert(pricingPlans).values(plansWithUser);
    
    console.log(`✅ Seeded ${suggestedPricingPlans.length} pricing plans successfully`);
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    throw error;
  }
}