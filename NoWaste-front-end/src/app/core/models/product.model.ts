
export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface Product {
  id?: number;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  expirationDate: string;
  location: string;
  image: string;
  status: ProductStatus;
  announcementId?: number;
}
