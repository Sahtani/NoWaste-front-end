import { Product } from '../product.model';
import {AnnouncementStatus} from '../../enum/AnnouncementStatus';

export interface Announcement {
  id?: string;
  title: string;
  createdAt?: Date;
  postedDate?: Date;
  status?: AnnouncementStatus;
  rejectionReason?: string;
  produits: Product[];
  userId?: number;
}
