import {User} from './user/user.model';

export interface AnnouncementDetails {

  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  userRating?: number;
  postedDate: Date;

  produits: ProductDetails[];

  interestedUsers?: User[];
  similarItems?: ProductDetails[];
  contactInfo?: ContactInfo;
}

export interface ProductDetails {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  location?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'EXPIRED';
  image?: string;
  expiryDate?: Date;
  category?: string;
  tags?: string[];
}

export interface InterestedUser {
  id: string;
  name: string;
  avatar?: string;
  contactInfo?: ContactInfo;
  dateInterested?: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  preferredMethod?: 'email' | 'phone' | 'app';
}
