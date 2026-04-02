import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateRoleRequest,
  UserRole
} from '../../assets/models/user/user.model';

const API_URL = 'http://localhost:3000/api/users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<User | null>(null);
  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Perfil (Rutas 'me') ──────────────────────────────────────────

  getProfile(): Observable<User> {
    this._loading.set(true);
    return this.http.get<User>(`${API_URL}/me`).pipe(
      tap(user => {
        this._user.set(user);
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'Error al cargar perfil'))
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    this._loading.set(true);
    return this.http.put<User>(`${API_URL}/me`, data).pipe(
      tap(updated => this._user.set(updated)),
      tap(() => this._loading.set(false)),
      catchError(err => this.handleError(err, 'Error al actualizar perfil'))
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    this._loading.set(true);
    // NestJS devuelve { message: '...' }
    return this.http.patch<{ message: string }>(`${API_URL}/me/password`, data).pipe(
      tap(() => this._loading.set(false)),
      catchError(err => this.handleError(err, 'Error al cambiar contraseña'))
    );
  }

  // ── Admin (Gestión de usuarios) ──────────────────────────────────

  getAllUsers(): Observable<User[]> {
    this._loading.set(true);
    return this.http.get<User[]>(API_URL).pipe(
      tap(users => {
        this._users.set(users);
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'Error al obtener usuarios'))
    );
  }

  createUser(data: CreateUserRequest): Observable<User> {
    this._loading.set(true);
    return this.http.post<User>(API_URL, data).pipe(
      tap(newUser => {
        this._users.update(list => [newUser, ...list]);
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'Error al crear usuario'))
    );
  }

  updateUserRole(id: number, role: UserRole): Observable<User> {
    this._loading.set(true);
    const body: UpdateRoleRequest = { role };

    return this.http.patch<User>(`${API_URL}/${id}/role`, body).pipe(
      tap(updatedUser => {
        this._users.update(list => list.map(u => u.id === id ? updatedUser : u));
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'Error al actualizar rol'))
    );
  }

  deleteUser(id: number): Observable<{ message: string }> {
    this._loading.set(true);
    return this.http.delete<{ message: string }>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this._users.update(list => list.filter(u => u.id !== id));
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'Error al eliminar usuario'))
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private handleError(err: any, defaultMsg: string) {
    this._loading.set(false);
    const msg = err.error?.message || defaultMsg;
    this._error.set(Array.isArray(msg) ? msg[0] : msg); // Maneja errores de class-validator
    return throwError(() => err);
  }

  clearError() { this._error.set(null); }

  clearUser() {
    this._user.set(null);
    this._users.set([]);
  }
}
