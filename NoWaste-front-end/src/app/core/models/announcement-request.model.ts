import {AnnouncementStatus} from '../enum/AnnouncementStatus';
import {Product} from './product.model';


export interface AnnouncementRequest {
  id?: string;
  title: string;
  createdAt?: Date;
  postedDate?: Date;
  status?: AnnouncementStatus;
  rejectionReason?: string;
  products: Product[];
  userId?:number;
}
