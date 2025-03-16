import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Announcement} from '../../models/announcement/announcement.model';
import {map, Observable} from 'rxjs';
import {AnnouncementResponse} from '../../../shared/interfaces/responses/AnnouncementResponse';

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

  createAnnouncement(announcement: any): Observable<Announcement> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    return this.http.post<Announcement>(`${this.apiUrl}`, announcement, { headers });
  }

  updateAnnouncement(id: number, announcement: any): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}${id}`, announcement);
  }

  deleteAnnouncement(id: number): Observable<void> {
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
}
