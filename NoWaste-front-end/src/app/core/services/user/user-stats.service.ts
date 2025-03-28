import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {UserStats} from '../../models/user/user.model';
import {environment} from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserStatsService {

  constructor(private http: HttpClient) { }


  getCurrentUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats/me`);
  }

  getUserStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats/users/${userId}`);
  }

  getDonorStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats/donors/${userId}`);
  }

  getBeneficiaryStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats/beneficiaries/${userId}`);
  }

  getOverallStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}stats/overall`);
  }
}
