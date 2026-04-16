import { Component, OnInit, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule,
    ButtonModule, DialogModule, SelectModule,
    TextareaModule, TimelineModule, TooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private orderService = inject(OrderService);
  private alertService = inject(AlertService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;

  showTrackingDialog = signal(false);
  showUpdateDialog = signal(false);
  selectedOrder = signal<Order | null>(null);

  updateData = {
    status: '' as OrderStatus,
    note: ''
  };

  // Opciones basadas en tu OrderStatus enum
  statusOptions = [
    { label: 'Procesando', value: 'Procesando' },
    { label: 'Confirmado', value: 'Confirmado' },
    { label: 'Enviado', value: 'Enviado' },
    { label: 'En camino', value: 'En camino' },
    { label: 'Entregado', value: 'Entregado' },
    { label: 'Cancelado', value: 'Cancelado' }
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

  getSeverity(status: string) {
    switch (status) {
      case 'Entregado': return 'success';
      case 'Enviado': case 'En camino': return 'info';
      case 'Procesando': case 'Confirmado': return 'warn';
      case 'Cancelado': return 'danger';
      default: return 'secondary';
    }
  }
}