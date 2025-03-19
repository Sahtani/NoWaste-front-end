import { Product } from '../product.model';
import {AnnouncementStatus} from '../../enum/AnnouncementStatus';
import {User} from '../user/user.model';

export interface Announcement {
  id?: string;
  title: string;
  createdAt?: Date;
  postedDate?: Date;
  status?: AnnouncementStatus;
  rejectionReason?: string;
  products: Product[];
  user?: User;
}
