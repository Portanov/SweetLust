import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse
} from '../../assets/models/user/user.model';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private userSignal = signal<User | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /**
   * Obtener perfil del usuario
   * Endpoint correcto: /users/me (no /users/profile)
   */
  getProfile(): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<User>(`${API_URL}/users/me`).pipe(
      tap({
        next: (user) => {
          this.userSignal.set(user);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cargar perfil');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Actualizar perfil
   * Endpoint correcto: /users/me (PUT)
   */
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<User>(`${API_URL}/users/me`, data).pipe(
      tap({
        next: (user) => {
          this.userSignal.set(user);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al actualizar perfil');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Cambiar contraseña
   * Endpoint correcto: /users/me/password (PATCH)
   */
  changePassword(data: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<ChangePasswordResponse>(`${API_URL}/users/me/password`, data).pipe(
      tap({
        next: () => {
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cambiar contraseña');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Refrescar perfil
   */
  refresh(): void {
    this.getProfile().subscribe();
  }
}
