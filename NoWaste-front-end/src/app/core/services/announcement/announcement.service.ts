import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Announcement } from '../../models/announcement/announcement.model';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';
import { AnnouncementResponse } from '../../../shared/interfaces/responses/AnnouncementResponse';
import { AnnouncementRequest } from '../../models/announcement-request.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = `${environment.apiUrlDash}/announcements/`;
  private cachedAnnouncements$: Observable<Announcement[]> | null = null;

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    if (!this.cachedAnnouncements$) {
      this.cachedAnnouncements$ = this.http.get<AnnouncementResponse>(this.apiUrl).pipe(
        map(response => response.content),
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching announcements:', error);
          return of([]);
        })
      );
    }
    return this.cachedAnnouncements$;
  }

  refreshAnnouncements(): Observable<Announcement[]> {
    this.cachedAnnouncements$ = null;
    return this.getAnnouncements();
  }

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching announcement with id ${id}:`, error);
        throw error;
      })
    );
  }

  createAnnouncement(announcementRequest: AnnouncementRequest): Observable<Announcement> {
    if (!announcementRequest.products) {
      announcementRequest.products = [];
    }

    const formData = new FormData();

    formData.append('announcement', new Blob([JSON.stringify(announcementRequest)], {
      type: 'application/json'
    }));

    return this.http.post<Announcement>(`${this.apiUrl}create`, formData).pipe(
      catchError(error => {
        console.error('Error creating announcement:', error);
        throw error;
      }),
      map(response => {
        this.cachedAnnouncements$ = null;
        return response;
      })
    );
  }

  updateAnnouncement(id: string, announcement: any): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}${id}`, announcement).pipe(
      catchError(error => {
        console.error(`Error updating announcement with id ${id}:`, error);
        throw error;
      }),
      map(response => {
        this.cachedAnnouncements$ = null;
        return response;
      })
    );
  }

  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting announcement with id ${id}:`, error);
        throw error;
      }),

      map(response => {
        this.cachedAnnouncements$ = null;
        return response;
      })
    );
  }

  approveAnnouncement(id: number): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/admin/announcements/${id}/approve`, {}).pipe(
      catchError(error => {
        console.error(`Error approving announcement with id ${id}:`, error);
        throw error;
      }),
      map(response => {
        this.cachedAnnouncements$ = null;
        return response;
      })
    );
  }

  rejectAnnouncement(id: number, reason: string): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/admin/announcements/${id}/reject`, { reason }).pipe(
      catchError(error => {
        console.error(`Error rejecting announcement with id ${id}:`, error);
        throw error;
      }),
      map(response => {
        this.cachedAnnouncements$ = null;
        return response;
      })
    );
  }

  getPendingAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/admin/announcements/pending`).pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching pending announcements:', error);
        return of([]);
      })
    );
  }

  uploadProductImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{imageUrl: string}>(`${this.apiUrl}upload`, formData).pipe(
      map(response => response.imageUrl),
      catchError(error => {
        console.error('Error uploading product image:', error);
        throw error;
      })
    );
  }
}
