import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {inject} from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }

  const requiredRoles = route.data?.['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasRequiredRole(requiredRoles)) {
    return true;
  } else {
    router.navigateByUrl('/unauthorized');
    return false;
  }
};
