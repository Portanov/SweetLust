import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Order,
  OrderResponse,
  CancelOrderResponse,
  PublicTrackingResponse,
  OrderStatus,
  UpdateTrackingRequest,
} from '../../assets/models/shop/order.model';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

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
          const normalizedOrders = orders.map(order => ({
            ...order,
            status: (order.status as string).toLowerCase() as OrderStatus
          }));
          this.ordersSignal.set(normalizedOrders);
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
          const normalizeOrder = {
            ...response,
            status: (response.status as string).toLowerCase() as OrderStatus
          }
          this.currentOrderSignal.set(normalizeOrder);
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

  // ── MÉTODOS DE ADMINISTRACIÓN (Nuevos) ──────────────────────

  /** Obtiene TODAS las órdenes del sistema (Solo Admin) */
  getAllOrders(): Observable<Order[]> {
    this.loadingSignal.set(true);
    return this.http.get<Order[]>(`${API_URL}/orders`).pipe(
      tap({
        next: (orders) => {
          this.ordersSignal.set(orders);
          this.loadingSignal.set(false);
        },
        error: (err) => this.handleError(err)
      })
    );
  }

  updateOrderStatus(orderId: number, data: UpdateTrackingRequest): Observable<any> {
    this.loadingSignal.set(true);

    return this.http.patch(`${API_URL}/orders/${orderId}/tracking`, data).pipe(
      tap({
        next: () => {
          this.loadingSignal.set(false);
          this.getAllOrders().subscribe();
        },
        error: (err) => {
          this.loadingSignal.set(false);
          this.handleError(err);
        }
      })
    );
  }

  // ── MÉTODOS DE SEGUIMIENTO (Públicos/Usuario) ────────────────

  /** Obtiene el historial de seguimiento de una orden */
  getTrackingHistory(orderId: number): Observable<PublicTrackingResponse> {
    return this.http.get<PublicTrackingResponse>(`${API_URL}/orders/${orderId}/tracking`);
  }

  /** Detalle de cualquier orden (Admin) */
  getOrderDetail(id: number): Observable<OrderResponse> {
    this.loadingSignal.set(true);
    return this.http.get<OrderResponse>(`${API_URL}/orders/${id}`).pipe(
      tap({
        next: (order) => {
          this.currentOrderSignal.set(order);
          this.loadingSignal.set(false);
        },
        error: (err) => this.handleError(err)
      })
    );
  }

  // ── AUXILIARES ──────────────────────────────────────────────

  private handleError(error: any) {
    this.loadingSignal.set(false);
    this.errorSignal.set(error.error?.message || 'Error en la operación');
    console.error('OrderService Error:', error);
  }

  /** Limpia el estado del servicio */
  clearState() {
    this.currentOrderSignal.set(null);
    this.errorSignal.set(null);
  }
}
