import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  RegisterRequest, RegisterResponse,
  LoginFirstStepRequest, LoginFirstStepResponse,
  VerifyPinRequest, VerifyPinResponse,
  User,
} from '../../assets/models/auth/auth.model';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;
const USER_KEY = environment.userKey;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly storage = localStorage;

  private readonly _user = signal<User | null>(this.parseStoredUser());

  readonly isLoggedIn = computed(() => !!this._user());
  readonly currentUser = computed(() => this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isClient = computed(() => this._user()?.role === 'client');

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/auth/register`, data).pipe(
      tap((res: any) => res),
      catchError((err) => throwError(() => err)),
    );
  }

  loginFirstStep(data: LoginFirstStepRequest): Observable<LoginFirstStepResponse> {
    return this.http.post<LoginFirstStepResponse>(`${API_URL}/auth/login-first-step`, data).pipe(
      catchError((err) => throwError(() => err)),
    );
  }

  verifyPin(data: VerifyPinRequest): Observable<VerifyPinResponse> {
    return this.http.post<VerifyPinResponse>(`${API_URL}/auth/verify-pin`, data).pipe(
      tap((res) => {

        const safeUser: User = {
          id: res.user.id, username: res.user.username,
          email: res.user.email, role: res.user.role,
        };

        this.storage.setItem(USER_KEY, JSON.stringify(safeUser));
        this._user.set(safeUser);
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  logout(): void {
    this.http.post(`${API_URL}/auth/logout`, {}).subscribe({
      error: () => { },
    });
    this.storage.removeItem(USER_KEY);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  private parseStoredUser(): User | null {
    try {
      const raw = this.storage.getItem(USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      if (!parsed?.id || !parsed?.email || !parsed?.role) return null;
      return parsed;
    } catch {
      this.storage.removeItem(USER_KEY);
      return null;
    }
  }
}
