import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn() || authService.isTokenExpired()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const user = authService.currentUser();
  if (user?.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};

export const adminMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn() || authService.isTokenExpired()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const user = authService.currentUser();
  if (user?.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
