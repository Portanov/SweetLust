import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

const PUBLIC_AUTH_ROUTES = [
  '/auth/register',
  '/auth/login-first-step',
  '/auth/verify-pin',
];

const TRUSTED_DOMAINS = [new URL(environment.apiUrl).hostname];

function isPublicRoute(url: string, method: string): boolean {
  if (PUBLIC_AUTH_ROUTES.some(route => url === route || url.startsWith(route))) {
    return true;
  }
  if (url.startsWith('/admin/')) {
    return false;
  }
  if (method === 'GET' && (url === '/products' || url.startsWith('/products/'))) {
    return true;
  }
  if (url === '/products' || url.startsWith('/products/')) {
    return false;
  }

  return false;
}

function isTrustedDomain(url: string) {
  try {
    return TRUSTED_DOMAINS.includes(new URL(url).hostname);
  } catch {
    return true;
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.currentToken();

  const isPublic = isPublicRoute(req.url, req.method);
  const shouldAttach = token && !isPublic && isTrustedDomain(req.url);

  const authReq = shouldAttach
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const body = event.body as Record<string, unknown>;
        if ('success' in body && 'data' in body) {
          return event.clone({ body: body['data'] });
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        authService.logout();
        void router.navigate(['/login']);
      }
      if (error.status === 403) {
        void router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    }),
  );
};
