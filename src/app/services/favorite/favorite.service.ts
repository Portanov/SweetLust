import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { FavoriteResponse, Favorite, AddFavoriteRequest, RemoveFavoriteRequest } from '../../assets/models/shop/favorite.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private http = inject(HttpClient);

  private favoritesSignal = signal<Favorite[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly favoriteIds = computed(() => {
    return new Set(this.favoritesSignal().map(fav => fav.productId));
  });

  readonly favoriteCount = computed(() => this.favoritesSignal().length);

  constructor() {
    this.loadFavorites();
  }

  /**
   * Cargar todos los favoritos del usuario
   * GET /favorites
   */
  loadFavorites(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Favorite[]>(`${API_URL}/favorites`).subscribe({
      next: (favorites) => {
        this.favoritesSignal.set(favorites);
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.errorSignal.set(error.error?.message || 'Error al cargar favoritos');
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Agregar producto a favoritos
   * POST /favorites con body { productId }
   */
  addFavorite(productId: number): Observable<FavoriteResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: AddFavoriteRequest = { productId };

    return this.http.post<FavoriteResponse>(`${API_URL}/favorites`, request).pipe(
      tap((response) => {
        const newFavorite: Favorite = {
          id: response.id,
          productId: response.productId,
          created_at: response.created_at,
          product: response.product
        };

        this.favoritesSignal.update(favorites => [...favorites, newFavorite]);
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.errorSignal.set(error.error?.message || 'Error al agregar a favoritos');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar producto de favoritos
   * DELETE /favorites con body { productId }
   */
  removeFavorite(productId: number): Observable<{ message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: RemoveFavoriteRequest = { productId };

    return this.http.delete<{ message: string }>(`${API_URL}/favorites`, { body: request }).pipe(
      tap(() => {
        this.favoritesSignal.update(favorites =>
          favorites.filter(fav => fav.productId !== productId)
        );
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.errorSignal.set(error.error?.message || 'Error al eliminar de favoritos');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar si un producto está en favoritos
   */
  isFavorite(productId: number): boolean {
    return this.favoriteIds().has(productId);
  }

  /**
   * Toggle favorito (agregar si no está, eliminar si está)
   */
  toggleFavorite(productId: number): Observable<FavoriteResponse | { message: string }> {
    if (this.isFavorite(productId)) {
      return this.removeFavorite(productId);
    } else {
      return this.addFavorite(productId);
    }
  }

  /**
   * Limpiar estado de error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Recargar favoritos desde el servidor
   */
  refresh(): void {
    this.loadFavorites();
  }
}
