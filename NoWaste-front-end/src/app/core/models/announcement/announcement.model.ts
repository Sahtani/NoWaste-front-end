import { Product } from '../product.model';
import {AnnouncementStatus} from '../../enum/AnnouncementStatus';

export interface Announcement {
  id?: number;
  title: string;
  createdAt?: Date;
  postedDate?: Date;
  status?: AnnouncementStatus;
  rejectionReason?: string;
  produits: Product[];
  userId?: number;
}
