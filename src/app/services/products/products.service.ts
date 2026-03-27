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

  getProducts(page: number = 1, limit: number = 10, search?: string): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductResponse>(`${API_URL}/products`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_URL}/products/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/products`, product);
  }

  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/products/${id}`);
  }

  updateStock(id: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/products/${id}/stock`, { quantity });
  }

  // ==================== Productos Destacados ====================

  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/best-sellers`);
  }

  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/new-arrivals`);
  }

  getProductsOnSale(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products/on-sale`);
  }

  // ==================== Ofertas ====================

  createOffer(productId: number, offer: CreateOfferRequest): Observable<Offer> {
    return this.http.post<Offer>(`${API_URL}/products/${productId}/offers`, offer);
  }

  getOffersByProduct(productId: number): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${API_URL}/products/${productId}/offers`);
  }

  updateOffer(offerId: number, offer: UpdateOfferRequest): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/products/offers/${offerId}`, offer);
  }

  deactivateOffer(offerId: number): Observable<Offer> {
    return this.http.patch<Offer>(`${API_URL}/products/offers/${offerId}/deactivate`, {});
  }

  deleteOffer(offerId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/products/offers/${offerId}`);
  }
}
