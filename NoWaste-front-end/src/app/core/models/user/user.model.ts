

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  role: string[];
  createdAt: string;
}

export interface UserStats {
  totalDonations: number;
  activeListings: number;
  itemsReceived: number;
  rating: number;
  impactMetrics: {
    wasteReduced: number;
    co2Saved: number;
    waterSaved: number;
  };
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'donation' | 'collection' | 'rating';
  description: string;
  date: string;
}

export enum Roles {
  DONOR = 'DONOR',
  BENEFICIARY = 'BENEFICIARY',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}
