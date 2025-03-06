import {Announcement} from '../../../core/models/announcement/announcement.model';

 export  interface AnnouncementResponse {
  content: Announcement[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}
