import { Product } from '../product.model';
import {AnnouncementStatus} from '../../enum/AnnouncementStatus';

export interface Announcement {
  id?: number;
  title: string;
  createdAt: string;
  postedDate?: string;
  status: AnnouncementStatus;
  rejectionReason?: string;
  produits: Product[];
  userId?: number;
}
