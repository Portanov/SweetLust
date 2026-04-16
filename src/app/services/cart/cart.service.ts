import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Cart,
  CartSummary,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartResponse,
  CheckoutRequest,
  CheckoutResponse
} from '../../assets/models/shop/cart.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);

  private cartItems = signal<any[]>([]);
  private cartTotal = signal(0);
  private itemCount = signal(0);
  private cartStatus = signal<string>('active');

  readonly items = this.cartItems.asReadonly();
  readonly total = this.cartTotal.asReadonly();
  readonly count = this.itemCount.asReadonly();
  readonly status = this.cartStatus.asReadonly();

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<CartResponse>(`${API_URL}/cart`).subscribe({
      next: (response) => {
        this.cartItems.set(response.summary.items);
        this.cartTotal.set(response.summary.total);
        this.itemCount.set(response.summary.itemCount);
        this.cartStatus.set(response.cart.status);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartResponse> {
    const request: AddToCartRequest = { productId, quantity };

    return this.http.post<CartResponse>(`${API_URL}/cart/add`, request).pipe(
      tap((response) => {
        this.cartItems.set(response.summary.items);
        this.cartTotal.set(response.summary.total);
        this.itemCount.set(response.summary.itemCount);
      })
    );
  }

  updateCartItem(itemId: number, quantity: number): Observable<CartResponse> {
    const request: UpdateCartItemRequest = { quantity };

    return this.http.patch<CartResponse>(`${API_URL}/cart/item/${itemId}`, request).pipe(
      tap((response) => {
        this.cartItems.set(response.summary.items);
        this.cartTotal.set(response.summary.total);
        this.itemCount.set(response.summary.itemCount);
      })
    );
  }

  removeCartItem(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${API_URL}/cart/item/${itemId}`).pipe(
      tap((response) => {
        this.cartItems.set(response.summary.items);
        this.cartTotal.set(response.summary.total);
        this.itemCount.set(response.summary.itemCount);
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${API_URL}/cart/clear`).pipe(
      tap(() => {
        this.cartItems.set([]);
        this.cartTotal.set(0);
        this.itemCount.set(0);
      })
    );
  }

  checkout(checkoutData: CheckoutRequest): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${API_URL}/cart/checkout`, checkoutData);
  }

  confirmPayment(addressId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${API_URL}/cart/confirm-payment`, { addressId }).pipe(
      tap(() => {
        this.cartItems.set([]);
        this.cartTotal.set(0);
        this.itemCount.set(0);
      })
    );
  }

  getCartSummary(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${API_URL}/cart/summary`);
  }
}
