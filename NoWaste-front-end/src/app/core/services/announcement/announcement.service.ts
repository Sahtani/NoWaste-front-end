import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Announcement} from '../../models/announcement/announcement.model';
import {map, Observable} from 'rxjs';
import {AnnouncementResponse} from '../../../shared/interfaces/responses/AnnouncementResponse';
import {AnnouncementRequest} from '../../models/announcement-request.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = `${environment.apiUrlDash}/announcements/`;

  constructor(private http: HttpClient) {
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<AnnouncementResponse>(this.apiUrl).pipe(
      map(response => response.content)
    );}

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}${id}`);
  }

  createAnnouncement(announcementRequest: AnnouncementRequest): Observable<Announcement> {
    const formData = new FormData();

    formData.append('announcement', new Blob([JSON.stringify(announcementRequest)], {
      type: 'application/json'
    }));

    return this.http.post<Announcement>(`${this.apiUrl}create`, formData);
  }

  updateAnnouncement(id: string, announcement: any): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}${id}`, announcement);
  }

  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  approveAnnouncement(id: number): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/admin/announcements/${id}/approve`, {});
  }

  rejectAnnouncement(id: number, reason: string): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/admin/announcements/${id}/reject`, { reason });
  }

  getPendingAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/admin/announcements/pending`);
  }

  uploadProductImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{imageUrl: string}>(`${this.apiUrl}upload`, formData)
      .pipe(map(response => response.imageUrl));
  }
}
