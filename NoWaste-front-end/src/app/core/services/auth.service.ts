import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {Router} from '@angular/router';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);

  constructor(private http: HttpClient) {
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }


  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {

          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);

            if (response.user) {
              localStorage.setItem('user_info', JSON.stringify(response.user));
            }
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    this.router.navigate(['/dashboard']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_info');
    const expirationDate = localStorage.getItem('expirationDate');

    if (!userData || !expirationDate) {
      return null;
    }

    try {
      const isExpired = new Date() > new Date(expirationDate);
      if (isExpired) {
        localStorage.removeItem('user_info');
        localStorage.removeItem('expirationDate');
        return null;
      }

      const user: User = JSON.parse(userData);
      return user;
    } catch (error) {
      localStorage.removeItem('user_info');
      localStorage.removeItem('expirationDate');
      return null;
    }
  }

  hasRequiredRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();

    if (!currentUser || !currentUser.roles) {
      return false;
    }

    return currentUser.roles.some(role =>
      roles.includes(role.toLowerCase())
    );
  }

}
