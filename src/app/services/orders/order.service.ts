import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Order,
  OrderResponse,
  CancelOrderResponse,
  PublicTrackingResponse,
  OrderStatus,
} from '../../assets/models/shop/order.model';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  private ordersSignal = signal<Order[]>([]);
  private currentOrderSignal = signal<OrderResponse | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly orders = this.ordersSignal.asReadonly();
  readonly currentOrder = this.currentOrderSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /**
   * Obtener todas las órdenes del usuario autenticado
   * GET /orders/my
   */
  getMyOrders(): Observable<Order[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Order[]>(`${API_URL}/orders/my`).pipe(
      tap({
        next: (orders) => {
          this.ordersSignal.set(orders);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cargar órdenes');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  /**
   * Obtener detalle de una orden específica del usuario
   * GET /orders/my/:id
   */
  getMyOrderDetail(orderId: number): Observable<OrderResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<OrderResponse>(`${API_URL}/orders/my/${orderId}`).pipe(
      tap({
        next: (response) => {
          this.currentOrderSignal.set(response);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cargar orden');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  /**
   * Cancelar una orden propia
   * PATCH /orders/my/:id/cancel
   */
  cancelMyOrder(orderId: number): Observable<CancelOrderResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<CancelOrderResponse>(`${API_URL}/orders/my/${orderId}/cancel`, {}).pipe(
      tap({
        next: (response) => {
          this.ordersSignal.update((orders) =>
            orders.map((order) =>
              order.id === orderId ? { ...order, status: 'cancelado' as OrderStatus } : order,
            ),
          );
          if (this.currentOrderSignal()?.id === orderId) {
            this.currentOrderSignal.update((order) =>
              order ? { ...order, status: 'cancelado' as OrderStatus } : null,
            );
          }
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cancelar orden');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  /**
   * Seguimiento público sin autenticación
   * GET /orders/:id/tracking
   */
  getPublicTracking(orderId: number): Observable<PublicTrackingResponse> {
    return this.http.get<PublicTrackingResponse>(`${API_URL}/orders/${orderId}/tracking`);
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Recargar órdenes
   */
  refresh(): void {
    this.getMyOrders().subscribe();
  }
}
