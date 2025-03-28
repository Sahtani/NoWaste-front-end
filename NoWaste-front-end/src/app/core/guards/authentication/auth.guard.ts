
import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../../services/authentication/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/']);
    return false;
  }

  const url = state.url;

  let userRole = '';
  if (Array.isArray(currentUser.role) && currentUser.role.length > 0) {
    userRole = currentUser.role[0];
  } else if (typeof currentUser.role === 'string') {
    userRole = currentUser.role;
  }

  if (url.includes('/admin-dashboard') && userRole !== 'ADMIN') {
    router.navigate(['/access-denied']);
    return false;
  }

  if (url.includes('/beneficiary-dashboard') && userRole !== 'BENEFICIARY') {
    router.navigate(['/access-denied']);
    return false;
  }

  if (url.includes('/beneficiary-dashboard') && userRole === 'DONOR') {
    router.navigate(['/donor/dashboard']);
    return false;
  }

  return true;
};
