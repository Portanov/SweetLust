import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && !authService.isTokenExpired()) {
    return true;
  }

  if (authService.isLoggedIn()) {
    authService.logout();
  }

  return router.createUrlTree(['/login']);
};

export const authMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && !authService.isTokenExpired()) {
    return true;
  }

  if (authService.isLoggedIn()) {
    authService.logout();
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && !authService.isTokenExpired()) {
    const user = authService.currentUser();
    if (user?.role === 'admin') {
      return router.createUrlTree(['/admin/dashboard']);
    } else {
      return router.createUrlTree(['/shop']);
    }
  }

  return true;
};
