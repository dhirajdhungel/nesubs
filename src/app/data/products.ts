// DEPRECATED: This file is no longer used.
// All product and category data now comes from the backend API.
// See /src/app/utils/api.ts for the new API functions.
// This file is kept for reference only and may be removed in the future.

export interface Package {
  id: string;
  name: string; // "60 UC", "300 Diamonds", "1 Month"
  price: number;
}

// Local asset imports (replacing legacy figma:asset paths)
import pubgLogo from "@/assets/d44fdeda0ac4ffd53eba21be8a2e3b2bb56796f7.png";

export interface PackageCategory {
  id: string;
  name: string; // "Popular Packages", "Value Packs"
  packages: Package[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Base/starting price for display on cards
  logo: string; // Circular app icon
  rating: number;
  instant: boolean;
  description: string;
  popular?: boolean;
  backgroundColor?: string; // For icon background
  packageCategories?: PackageCategory[]; // Optional: for products with multiple packages
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "games", name: "Games", icon: "Gamepad2" },
  { id: "productivity", name: "Productivity", icon: "Briefcase" },
  { id: "entertainment", name: "Entertainment", icon: "Tv" },
  { id: "giftcards", name: "Gift Cards", icon: "Gift" },
];

export const products: Product[] = [
  // Games
  {
    id: "1",
    name: "PUBG Mobile",
    category: "games",
    price: 120,
    logo: pubgLogo,
    rating: 4.8,
    instant: true,
    description: "PUBG Mobile UC - Get UC instantly delivered to your account. Top up your UC and get exclusive skins, weapon upgrades, and battle passes.",
    popular: true,
    backgroundColor: "#FFA000",
    packageCategories: [
      {
        id: "popular",
        name: "Popular Packages",
        packages: [
          { id: "1-1", name: "60 UC", price: 120 },
          { id: "1-2", name: "325 UC", price: 600 },
          { id: "1-3", name: "660 UC", price: 1200 },
          { id: "1-4", name: "1800 UC", price: 3000 }
        ]
      },
      {
        id: "value",
        name: "Value Packs",
        packages: [
          { id: "1-5", name: "3850 UC", price: 6000 },
          { id: "1-6", name: "8100 UC", price: 12000 },
          { id: "1-7", name: "16200 UC", price: 24000 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Free Fire",
    category: "games",
    price: 150,
    logo: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&h=200&fit=crop",
    rating: 4.6,
    instant: true,
    description: "Free Fire Diamonds - Instant delivery to your account. Get exclusive characters, weapon skins, and premium items.",
    popular: true,
    backgroundColor: "#FF5722",
    packageCategories: [
      {
        id: "popular",
        name: "Popular Packages",
        packages: [
          { id: "2-1", name: "100 Diamonds", price: 150 },
          { id: "2-2", name: "310 Diamonds", price: 450 },
          { id: "2-3", name: "520 Diamonds", price: 750 },
          { id: "2-4", name: "1060 Diamonds", price: 1500 }
        ]
      },
      {
        id: "mega",
        name: "Mega Deals",
        packages: [
          { id: "2-5", name: "2180 Diamonds", price: 3000 },
          { id: "2-6", name: "5600 Diamonds", price: 7500 }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Mobile Legends",
    category: "games",
    price: 180,
    logo: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=200&fit=crop",
    rating: 4.7,
    instant: true,
    description: "Mobile Legends Diamonds - Instant delivery. Buy heroes, skins, and exclusive items.",
    popular: true,
    backgroundColor: "#3F51B5",
    packageCategories: [
      {
        id: "popular",
        name: "Popular Packages",
        packages: [
          { id: "3-1", name: "86 Diamonds", price: 180 },
          { id: "3-2", name: "172 Diamonds", price: 360 },
          { id: "3-3", name: "344 Diamonds", price: 720 },
          { id: "3-4", name: "706 Diamonds", price: 1440 }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Valorant",
    category: "games",
    price: 499,
    logo: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "Valorant Points for skins and battle passes.",
    backgroundColor: "#FF4655"
  },
  
  // Productivity
  {
    id: "5",
    name: "ChatGPT",
    category: "productivity",
    price: 2499,
    logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop",
    rating: 4.9,
    instant: true,
    description: "ChatGPT Plus - AI-powered assistant subscription.",
    popular: true,
    backgroundColor: "#10A37F"
  },
  {
    id: "6",
    name: "Creative Cloud",
    category: "productivity",
    price: 3999,
    logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "Adobe Creative Cloud - All apps included.",
    popular: true,
    backgroundColor: "#DA1F26"
  },
  {
    id: "7",
    name: "Microsoft 365",
    category: "productivity",
    price: 1899,
    logo: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=200&h=200&fit=crop",
    rating: 4.7,
    instant: true,
    description: "Microsoft 365 - Office apps and cloud storage.",
    popular: true,
    backgroundColor: "#0078D4"
  },
  {
    id: "8",
    name: "Notion",
    category: "productivity",
    price: 999,
    logo: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "Notion - All-in-one workspace.",
    backgroundColor: "#000000"
  },

  // Entertainment
  {
    id: "9",
    name: "Netflix",
    category: "entertainment",
    price: 1299,
    logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop",
    rating: 4.9,
    instant: true,
    description: "Netflix Premium - 4K streaming on multiple devices.",
    popular: true,
    backgroundColor: "#E50914"
  },
  {
    id: "10",
    name: "Amazon Prime",
    category: "entertainment",
    price: 1499,
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "Amazon Prime Video - Movies, shows, and more.",
    popular: true,
    backgroundColor: "#00A8E1"
  },
  {
    id: "11",
    name: "HBO Max",
    category: "entertainment",
    price: 1199,
    logo: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "HBO Max - Premium series and movies.",
    backgroundColor: "#6C3FC7"
  },
  {
    id: "12",
    name: "Spotify",
    category: "entertainment",
    price: 1599,
    logo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "Spotify Premium - Ad-free music streaming.",
    popular: true,
    backgroundColor: "#1DB954"
  },
  {
    id: "13",
    name: "YouTube Premium",
    category: "entertainment",
    price: 129,
    logo: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "YouTube Premium - Ad-free videos and music.",
    backgroundColor: "#FF0000"
  },

  // Gift Cards
  {
    id: "14",
    name: "Steam Card",
    category: "giftcards",
    price: 1350,
    logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop",
    rating: 4.7,
    instant: true,
    description: "Steam Gift Card - Purchase games and DLC.",
    popular: true,
    backgroundColor: "#171A21"
  },
  {
    id: "15",
    name: "Google Play",
    category: "giftcards",
    price: 1000,
    logo: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=200&h=200&fit=crop",
    rating: 4.9,
    instant: true,
    description: "Google Play Gift Card - Apps, games, and more.",
    backgroundColor: "#01875F"
  },
  {
    id: "16",
    name: "PlayStation",
    category: "giftcards",
    price: 3000,
    logo: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop",
    rating: 4.9,
    instant: true,
    description: "PlayStation Store Card - Games and subscriptions.",
    backgroundColor: "#003087"
  },
  {
    id: "17",
    name: "Amazon Card",
    category: "giftcards",
    price: 500,
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=200&h=200&fit=crop",
    rating: 4.9,
    instant: true,
    description: "Amazon Gift Card - Shop millions of products.",
    backgroundColor: "#FF9900"
  },
  {
    id: "18",
    name: "iTunes Card",
    category: "giftcards",
    price: 2000,
    logo: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200&h=200&fit=crop",
    rating: 4.8,
    instant: true,
    description: "iTunes Gift Card - Music, apps, and more.",
    backgroundColor: "#FA57C1"
  },
];

export const paymentMethods = [
  { id: "esewa", name: "eSewa", icon: "Wallet" },
  { id: "khalti", name: "Khalti", icon: "CreditCard" },
  { id: "connectips", name: "ConnectIPS", icon: "Building2" },
  { id: "card", name: "Debit/Credit Card", icon: "CreditCard" },
];