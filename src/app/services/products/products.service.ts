// products.service.ts
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
  Offer,
  ProductFilters,
  CategoryWithCount,
  ProductCategory
} from '../../assets/models/shop/product.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  // ─────────────────────────────────────────────────────────────────
  // RUTAS PÚBLICAS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Obtiene todos los productos con múltiples filtros
   */
  getProducts(filters?: ProductFilters): Observable<ProductResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.onSale !== undefined) params = params.set('onSale', filters.onSale.toString());
      if (filters.inStock !== undefined) params = params.set('inStock', filters.inStock.toString());
    }

    return this.http.get<ProductResponse>(`${API_URL}/products`, { params });
  }

  /**
   * Obtiene todas las categorías con conteo de productos
   */
  getCategories(): Observable<CategoryWithCount[]> {
    return this.http.get<CategoryWithCount[]>(`${API_URL}/products/categories`);
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_URL}/products/${id}`);
  }

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

  /**
   * Obtiene todas las ofertas de un producto (solo lectura)
   */
  getOffersByProduct(productId: number): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${API_URL}/products/${productId}/offers`);
  }

  // ─────────────────────────────────────────────────────────────────
  // RUTAS DE ADMIN
  // ─────────────────────────────────────────────────────────────────

  /**
   * Crea un nuevo producto (solo admin)
   * @route POST /admin/products
   */
  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/admin/products`, product);
  }

  /**
   * Actualiza un producto existente (solo admin)
   * @route PATCH /admin/products/:id
   */
  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/admin/products/${id}`, product);
  }

  /**
   * Elimina un producto (solo admin)
   * @route DELETE /admin/products/:id
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/products/${id}`);
  }

  /**
   * Actualiza el stock de un producto (solo admin)
   * @route PATCH /admin/products/:id/stock
   */
  updateStock(id: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/admin/products/${id}/stock`, { quantity });
  }

  /**
   * Crea una nueva oferta para un producto (solo admin)
   * @route POST /admin/products/:id/offers
   */
  createOffer(productId: number, offer: CreateOfferRequest): Observable<Offer> {
    return this.http.post<Offer>(`${API_URL}/admin/products/${productId}/offers`, offer);
  }

  /**
   * Actualiza una oferta existente (solo admin)
   * @route PATCH /admin/products/offers/:offerId
   */
  updateOffer(offerId: number, offer: UpdateOfferRequest): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/admin/products/offers/${offerId}`, offer);
  }

  /**
   * Desactiva una oferta (solo admin)
   * @route PATCH /admin/products/offers/:offerId/deactivate
   */
  deactivateOffer(offerId: number): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/admin/products/offers/${offerId}/deactivate`, {});
  }

  /**
   * Elimina permanentemente una oferta (solo admin)
   * @route DELETE /admin/products/offers/:offerId
   */
  deleteOffer(offerId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/admin/products/offers/${offerId}`);
  }
}