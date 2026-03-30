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

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  /**
   * Obtiene todos los productos con múltiples filtros
   * Soporta: search, category, minPrice, maxPrice, onSale, inStock
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
