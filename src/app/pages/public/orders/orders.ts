import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/orders/order.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { OrderStatus } from '../../../assets/models/shop/order.model';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ChipModule } from 'primeng/chip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    SkeletonModule,
    ScrollPanelModule,
    ChipModule,
  ],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  public router = inject(Router);

  orders = this.orderService.orders;
  loading = this.orderService.loading;

  selectedStatus = signal<OrderStatus | null>(null);

  filteredOrders = computed(() => {
    const selected = this.selectedStatus();
    if (selected === null) {
      return this.orders();
    }
    return this.orders().filter(order => order.status === selected);
  });

  availableStatuses = [
    OrderStatus.CONFIRMADO,
    OrderStatus.PROCESANDO,
    OrderStatus.ENVIADO,
    OrderStatus.EN_CAMINO,
    OrderStatus.ENTREGADO,
    OrderStatus.CANCELADO
  ];

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe();
  }

  filterOrdersByStatus(status: OrderStatus): void {
    this.selectedStatus.set(this.selectedStatus() === status ? null : status);
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case OrderStatus.ENTREGADO:
        return 'success';
      case OrderStatus.PROCESANDO:
        return 'info';
      case OrderStatus.CONFIRMADO:
        return 'info';
      case OrderStatus.ENVIADO:
        return 'warn';
      case OrderStatus.EN_CAMINO:
        return 'warn';
      case OrderStatus.CANCELADO:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PROCESANDO:
        return 'Procesando';
      case OrderStatus.CONFIRMADO:
        return 'Confirmado';
      case OrderStatus.ENVIADO:
        return 'Enviado';
      case OrderStatus.EN_CAMINO:
        return 'En camino';
      case OrderStatus.ENTREGADO:
        return 'Entregado';
      case OrderStatus.CANCELADO:
        return 'Cancelado';
      default:
        return status;
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PROCESANDO:
        return 'pi pi-clock';
      case OrderStatus.CONFIRMADO:
        return 'pi pi-check-circle';
      case OrderStatus.ENVIADO:
        return 'fa-solid fa-cart-flatbed';
      case OrderStatus.EN_CAMINO:
        return 'fa-solid fa-truck';
      case OrderStatus.ENTREGADO:
        return 'fa-solid fa-boxes-packing';
      case OrderStatus.CANCELADO:
        return 'pi pi-times-circle';
      default:
        return status;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refresh(): void {
    this.orderService.refresh();
  }
}
