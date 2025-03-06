import { Product } from '../product.model';

export interface Announcement {
  id?: number;
  title: string;
  createdAt: string;
  postedDate: string;
  produits: Product[];
  userId: number;
}
