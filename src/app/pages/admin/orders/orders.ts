import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/orders/order.service';
import { AlertService } from '../../../services/alert/alert.service';
import { OrderStatus, Order } from '../../../assets/models/shop/order.model';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule,
    ButtonModule, DialogModule, SelectModule,
    TextareaModule, TimelineModule, TooltipModule,
    InputTextModule, IconFieldModule, InputIconModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private alertService = inject(AlertService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;
  searchValue = '';
  selectedStatus: OrderStatus | null = null;

  tableOrders = computed(() => this.orders().map((order) => ({
    ...order,
    customerName: order.user?.username || 'Cliente sin cuenta',
    customerEmail: order.user?.email || '',
    productSummary: this.getProductSummary(order),
    itemCount: this.getItemCount(order),
  })));

  showTrackingDialog = signal(false);
  showUpdateDialog = signal(false);
  selectedOrder = signal<Order | null>(null);

  updateData = {
    status: '' as OrderStatus,
    note: ''
  };

  // Opciones basadas en tu OrderStatus enum
  statusOptions = [
    { label: 'Procesando', value: OrderStatus.PROCESANDO },
    { label: 'Confirmado', value: OrderStatus.CONFIRMADO },
    { label: 'Enviado', value: OrderStatus.ENVIADO },
    { label: 'En camino', value: OrderStatus.EN_CAMINO },
    { label: 'Entregado', value: OrderStatus.ENTREGADO },
    { label: 'Cancelado', value: OrderStatus.CANCELADO }
  ];

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe();
  }

  openUpdateStatus(order: any) {
    this.selectedOrder.set(order);
    this.updateData = { status: order.status as OrderStatus, note: '' };
    this.showUpdateDialog.set(true);
  }

  saveStatusUpdate() {
    if (!this.selectedOrder()) return;

    this.orderService.updateOrderStatus(this.selectedOrder()!.id, this.updateData as any).subscribe({
      next: () => {
        this.alertService.success('Orden Actualizada', 'Se ha registrado el nuevo estado y la nota de seguimiento.');
        this.showUpdateDialog.set(false);
        this.orderService.getAllOrders().subscribe();
      }
    });
  }

  viewTracking(order: any) {
    this.orderService.getOrderDetail(order.id).subscribe({
      next: (fullOrder) => {
        this.selectedOrder.set(fullOrder as any);
        this.showTrackingDialog.set(true);
      }
    });
  }

  getItemCount(order: Order): number {
    return order.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }

  getProductSummary(order: Order): string {
    if (!order.items?.length) {
      return 'Sin productos';
    }

    const [firstItem, ...rest] = order.items;
    return rest.length > 0
      ? `${firstItem.product.title} +${rest.length}`
      : firstItem.product.title;
  }

  getStatusLabel(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.PROCESANDO:
        return 'Procesando';
      case OrderStatus.CONFIRMADO:
        return 'Confirmado';
      case OrderStatus.ENVIADO:
        return 'Enviado';
      case OrderStatus.EN_CAMINO:
        return 'En transito';
      case OrderStatus.ENTREGADO:
        return 'Entregado';
      case OrderStatus.CANCELADO:
        return 'Cancelado';
      default:
        return status;
    }
  }

  formatShortDate(value: string | Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  getSeverity(status: string) {
    switch (status) {
      case OrderStatus.ENTREGADO: return 'success';
      case OrderStatus.ENVIADO:
      case OrderStatus.EN_CAMINO:
        return 'info';
      case OrderStatus.PROCESANDO:
      case OrderStatus.CONFIRMADO:
        return 'warn';
      case OrderStatus.CANCELADO:
        return 'danger';
      default: return 'secondary';
    }
  }
}