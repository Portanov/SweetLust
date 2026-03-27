import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateUserRequest,
  UpdateRoleRequest
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

  private usersSignal = signal<User[]>([]);
  private loadingUsersSignal = signal(false);

  readonly users = this.usersSignal.asReadonly();
  readonly loadingUsers = this.loadingUsersSignal.asReadonly();

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

  // ==================== Gestión de Usuarios (Admin) ====================

  /**
   * Obtener todos los usuarios (solo admin)
   * GET /users
   */
  getAllUsers(): Observable<User[]> {
    this.loadingUsersSignal.set(true);

    return this.http.get<User[]>(`${API_URL}/users`).pipe(
      tap({
        next: (users) => {
          this.usersSignal.set(users);
          this.loadingUsersSignal.set(false);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.loadingUsersSignal.set(false);
        }
      })
    );
  }

  /**
   * Obtener un usuario por ID (solo admin)
   * GET /users/:id
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/users/${id}`);
  }

  /**
   * Crear un nuevo usuario (solo admin)
   * POST /users
   */
  createUser(data: CreateUserRequest): Observable<User> {
    this.loadingUsersSignal.set(true);

    return this.http.post<User>(`${API_URL}/users`, data).pipe(
      tap({
        next: () => {
          this.loadingUsersSignal.set(false);
          this.getAllUsers().subscribe(); // Recargar lista
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loadingUsersSignal.set(false);
        }
      })
    );
  }

  /**
   * Actualizar rol de usuario (solo admin)
   * PATCH /users/:id/role
   */
  updateUserRole(id: number, role: 'admin' | 'client'): Observable<User> {
    this.loadingUsersSignal.set(true);

    const request: UpdateRoleRequest = { role };

    return this.http.patch<User>(`${API_URL}/users/${id}/role`, request).pipe(
      tap({
        next: () => {
          this.loadingUsersSignal.set(false);
          this.getAllUsers().subscribe(); // Recargar lista
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.loadingUsersSignal.set(false);
        }
      })
    );
  }

  /**
   * Eliminar usuario (solo admin)
   * DELETE /users/:id
   */
  deleteUser(id: number): Observable<{ message: string }> {
    this.loadingUsersSignal.set(true);

    return this.http.delete<{ message: string }>(`${API_URL}/users/${id}`).pipe(
      tap({
        next: () => {
          this.loadingUsersSignal.set(false);
          this.getAllUsers().subscribe(); // Recargar lista
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.loadingUsersSignal.set(false);
        }
      })
    );
  }

  // ==================== Helpers ====================

  /**
   * Limpiar error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Refrescar perfil
   */
  refreshProfile(): void {
    this.getProfile().subscribe();
  }

  /**
   * Refrescar lista de usuarios
   */
  refreshUsers(): void {
    this.getAllUsers().subscribe();
  }

  /**
   * Refrescar perfil
   */
  refresh(): void {
    this.getProfile().subscribe();
  }
}
