import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, tap} from 'rxjs';
import {Router} from '@angular/router';
import {User} from '../../models/user/user.model';
import {AuthenticationResponse} from '../../models/authentication-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  private tokenExpirationTime = 24 * 60 * 60 * 1000;

  constructor(private http: HttpClient) {
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<AuthenticationResponse> {
    console.log('[AuthService] Login attempt with:', credentials.email);

    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('[AuthService] Login response received:', response);

          try {
            if (response && response.token) {

              localStorage.setItem('auth_token', response.token);
              const expirationDate = new Date(new Date().getTime() + this.tokenExpirationTime);
              localStorage.setItem('expirationDate', expirationDate.toISOString());
              console.log('[AuthService] Set expiration date:', expirationDate);

              let userInfo: any = {};
            //  userInfo.name = response.name;

              userInfo.email = response.email;

              userInfo.role = response.role;

              const userInfoJSON = JSON.stringify(userInfo);
              localStorage.setItem('user_info', userInfoJSON);
              console.log('[AuthService] Stored user_info in localStorage:', userInfoJSON);

              console.log('[AuthService] Verification - user_info from localStorage:', localStorage.getItem('user_info'));
            } else {
              console.error('[AuthService] Response is missing access_token');
            }
          } catch (error) {
            console.error('[AuthService] Error processing login response:', error);
          }
        }),
        catchError(error => {
          console.error('[AuthService] HTTP error during login:', error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('expirationDate');
    console.log('[AuthService] Items removed from localStorage');
    this.router.navigate(['']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expirationDate = localStorage.getItem('expirationDate');

    if (!token) {
      console.log('[AuthService] No auth_token found in localStorage');
      return false;
    }

    if (!expirationDate) {
      console.log('[AuthService] No expirationDate found in localStorage');
      return false;
    }

    const isExpired = new Date() > new Date(expirationDate);
    if (isExpired) {
      console.log('[AuthService] Token has expired');
      this.logout();
      return false;
    }

    console.log('[AuthService] User is authenticated');
    return true;
  }

  getCurrentUser(): User | null {

    if (!this.isAuthenticated()) {
      console.log('User is not authenticated');
      return null;
    }

    const userData = localStorage.getItem('user_info');
    console.log('[AuthService] Retrieved user_info from localStorage:', userData);

    if (!userData) {
      console.log('No user_info found in localStorage');
      return null;
    }

    try {
      const user = JSON.parse(userData) as User;
      console.log('[AuthService] Successfully parsed user data:', user);
      return user;
    } catch (error) {
      console.error('[AuthService] Error parsing user data:', error);
      this.logout();
      return null;
    }
  }

}
