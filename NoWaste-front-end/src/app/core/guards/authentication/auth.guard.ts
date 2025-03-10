// Dans auth.guard.ts
import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../../services/authentication/auth.service';

// Dans auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    router.navigate(['/login']);
    return false;
  }

  // Vérifier l'URL de destination et autoriser en fonction du rôle
  const url = state.url;

  // Obtenir le rôle de l'utilisateur
  let userRole = '';
  if (Array.isArray(currentUser.role) && currentUser.role.length > 0) {
    userRole = currentUser.role[0]; // Utiliser le premier rôle si c'est un tableau
  } else if (typeof currentUser.role === 'string') {
    userRole = currentUser.role;
  }

  // Autoriser ou rediriger en fonction de l'URL et du rôle
  if (url.includes('/admin-dashboard') && userRole !== 'ADMIN') {
    router.navigate(['/access-denied']);
    return false;
  }

  if (url.includes('/beneficiary-dashboard') && userRole !== 'BENEFICIARY') {
    router.navigate(['/access-denied']);
    return false;
  }

  // Les donateurs ne peuvent pas accéder au tableau de bord des bénéficiaires
  if (url.includes('/beneficiary-dashboard') && userRole === 'DONOR') {
    router.navigate(['/announcements']);
    return false;
  }

  // Par défaut, autoriser l'accès
  return true;
};
