import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  RegisterRequest,
  RegisterResponse,
  LoginFirstStepRequest,
  LoginFirstStepResponse,
  VerifyPinRequest,
  VerifyPinResponse,
  JwtPayload,
  User,
} from '../../assets/models/auth/auth.model';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';
const API_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  private readonly _user = signal<User | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null
  );

  readonly isLoggedIn = computed(() => {
    const token = this._token();
    if (!token) return false;
    return !this.isTokenExpired();
  });

  readonly currentToken = computed(() => this._token());
  readonly currentUser = computed(() => this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isClient = computed(() => this._user()?.role === 'client');

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/auth/register`, data);
  }

  loginFirstStep(data: LoginFirstStepRequest): Observable<LoginFirstStepResponse> {
    return this.http.post<LoginFirstStepResponse>(`${API_URL}/auth/login-first-step`, data);
  }

  verifyPin(data: VerifyPinRequest): Observable<VerifyPinResponse> {
    return this.http
      .post<VerifyPinResponse>(`${API_URL}/auth/verify-pin`, data)
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this._token.set(res.access_token);
          this._user.set(res.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  isTokenExpired(): boolean {
    const token = this._token();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1];
      const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}
