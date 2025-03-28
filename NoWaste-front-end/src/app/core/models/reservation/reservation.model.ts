import {Announcement} from '../announcement/announcement.model';

export interface Reservation {
  id: number;
  title: string;
  donorName: string;
  donorId: number;
  beneficiaryId?: number;
  location: string;
  image?: string;
  reservationDate: Date;
  pickupDate?: Date;
  status: ReservationStatus;
  announcementId: number;
  items?: ReservationItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  announcement: Announcement;
}

export interface ReservationItem {
  id: number;
  name: string;
  quantity: number;
  weight?: number;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
