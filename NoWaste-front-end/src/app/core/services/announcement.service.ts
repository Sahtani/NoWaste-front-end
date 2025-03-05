import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Announcement} from '../models/announcement.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl);
  }

  getAnnouncementById(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`);
  }

  createAnnouncement(formData: FormData): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, formData);
  }

  updateAnnouncement(id: number, formData: FormData): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/${id}`, formData);
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
