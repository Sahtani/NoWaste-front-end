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

  private currentUserCache: User | null = null;

  constructor(private http: HttpClient) {

    this.initCurrentUserCache();
  }

  private initCurrentUserCache(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        this.currentUserCache = jwtDecode(token);
      } catch (error) {
        this.currentUserCache = null;
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, userData).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            const expirationDate = new Date(new Date().getTime() + this.tokenExpirationTime);
            localStorage.setItem('expirationDate', expirationDate.toISOString());

            let userInfo: any = {};
            userInfo.email = response.email;
            userInfo.role = response.role;

            localStorage.setItem('user_info', JSON.stringify(userInfo));

            this.initCurrentUserCache();
          }
        }),
        catchError(error => {
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_info');
    localStorage.removeItem('expirationDate');
    this.currentUserCache = null;
    this.router.navigate(['']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expirationDate = localStorage.getItem('expirationDate');

    if (!token || !expirationDate) {
      return false;
    }

    const isExpired = new Date() > new Date(expirationDate);
    if (isExpired) {
      this.logout();
      return false;
    }

    return true;
  }


  getCurrentUser(): User | null {
    if (this.currentUserCache) {
      return this.currentUserCache;
    }

    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    try {
      this.currentUserCache = jwtDecode(token);
      return this.currentUserCache;
    } catch (error) {
      return null;
    }
  }
}
