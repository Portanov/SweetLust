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

const TRUSTED_DOMAINS = [new URL(environment.apiUrl).hostname];
const API_BASE_PATH = new URL(environment.apiUrl).pathname;

// Rutas verdaderamente públicas: no necesitan enviar la cookie de sesión.
function isPublicRoute(url: string, method: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(url, environment.apiUrl).pathname;
  } catch {
    pathname = url;
  }

  const productsPath = `${API_BASE_PATH}/products`;
  return method === 'GET' && (pathname === productsPath || pathname.startsWith(`${productsPath}/`));
}

function isTrustedDomain(url: string) {
  try {
    return TRUSTED_DOMAINS.includes(new URL(url, environment.apiUrl).hostname);
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

  const isPublic = isPublicRoute(req.url, req.method);
  const shouldAttachCredentials = !isPublic && isTrustedDomain(req.url);

  const credReq = shouldAttachCredentials
    ? req.clone({ withCredentials: true })
    : req;

  return next(credReq).pipe(
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
      // Solo forzamos logout/redirect si había una sesión activa; un 401 anónimo no debe expulsar de páginas públicas.
      if (error.status === 401 && authService.isLoggedIn()) {
        authService.logout();
      }
      if (error.status === 403) {
        void router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    }),
  );
};
