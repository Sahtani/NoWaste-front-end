import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {User, UserStats} from '../../models/user/user.model';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userProfileSubject = new BehaviorSubject<User | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserProfile(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}profile/${id}`).pipe(
      tap(user => this.userProfileSubject.next(user))
    );
  }

  updateUserProfile(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}profile/${id}`, userData).pipe(
      tap(updatedUser => this.userProfileSubject.next(updatedUser))
    );
  }
  updateAvatar(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/users/avatar`, formData);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats`);
  }

  getCurrentUserProfile(): User | null {
    return this.userProfileSubject.value;
  }
}
