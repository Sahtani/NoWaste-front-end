import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {Router} from '@angular/router';
import {User} from '../../models/user/user.model';
import {AuthenticationResponse} from '../../models/authentication-response';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  private tokenExpirationTime = 24 * 60 * 60 * 1000;
  private tokenKey = 'auth_token';
  constructor(private http: HttpClient) {
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<AuthenticationResponse> {

    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          try {
            if (response && response.token) {

              localStorage.setItem('auth_token', response.token);
              const expirationDate = new Date(new Date().getTime() + this.tokenExpirationTime);
              localStorage.setItem('expirationDate', expirationDate.toISOString());

              let userInfo: any = {};

              userInfo.email = response.email;

              userInfo.role = response.role;

              const userInfoJSON = JSON.stringify(userInfo);
              localStorage.setItem('user_info', userInfoJSON);
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
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  getCurrentUser(): User | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }


}
