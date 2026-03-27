import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateOfferRequest,
  UpdateOfferRequest,
  Offer
} from '../../assets/models/shop/product.model';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  // ==================== CRUD de Productos ====================

  /**
   * Obtiene todos los productos con filtro opcional de búsqueda
   * Nota: El backend no soporta paginación en este endpoint
   */
  getProducts(search?: string): Observable<ProductResponse> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductResponse>(`${API_URL}/products`, { params });
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_URL}/products/${id}`);
  }

  /**
   * Crea un nuevo producto (solo admin)
   */
  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/products`, product);
  }

  /**
   * Actualiza un producto existente (solo admin)
   */
  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/products/${id}`, product);
  }

  /**
   * Elimina un producto (solo admin)
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/products/${id}`);
  }

  /**
   * Actualiza el stock de un producto (solo admin)
   */
  updateStock(id: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/products/${id}/stock`, { quantity });
  }

  // ==================== Productos Destacados ====================

  /**
   * Obtiene los 3 productos más vendidos
   */
  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/best-sellers`);
  }

  /**
   * Obtiene los últimos 5 productos agregados
   */
  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/new-arrivals`);
  }

  /**
   * Obtiene todos los productos con ofertas activas
   */
  getProductsOnSale(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/on-sale`);
  }

  // ==================== Ofertas ====================

  /**
   * Crea una nueva oferta para un producto (solo admin)
   */
  createOffer(productId: number, offer: CreateOfferRequest): Observable<Offer> {
    return this.http.post<Offer>(`${API_URL}/products/${productId}/offers`, offer);
  }

  /**
   * Obtiene todas las ofertas de un producto (incluyendo inactivas)
   */
  getOffersByProduct(productId: number): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${API_URL}/products/${productId}/offers`);
  }

  /**
   * Actualiza una oferta existente (solo admin)
   */
  updateOffer(offerId: number, offer: UpdateOfferRequest): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/products/offers/${offerId}`, offer);
  }

  /**
   * Desactiva una oferta (solo admin)
   */
  deactivateOffer(offerId: number): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/products/offers/${offerId}/deactivate`, {});
  }

  /**
   * Elimina permanentemente una oferta (solo admin)
   */
  deleteOffer(offerId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/products/offers/${offerId}`);
  }
}
