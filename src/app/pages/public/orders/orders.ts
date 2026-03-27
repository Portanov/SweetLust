import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/orders/order.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { OrderStatus } from '../../../assets/models/shop/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe();
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
