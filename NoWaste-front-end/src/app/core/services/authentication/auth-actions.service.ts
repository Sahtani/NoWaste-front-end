import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthActionsService {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Méthode de déconnexion généralisée
  performLogout(): void {
    this.authService.logout();
    // Rediriger vers la page d'accueil après déconnexion
    this.router.navigate(['/']);
  }

  // Méthode pour rediriger vers la page de connexion
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Méthode pour rediriger vers la page d'inscription
  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
