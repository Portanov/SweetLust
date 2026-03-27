import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/orders/order.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';
import { OrderStatus } from '../../../assets/models/shop/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    TimelineModule,
    SkeletonModule
  ],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationAlertService);

  order = this.orderService.currentOrder;
  loading = this.orderService.loading;
  canceling = signal(false);

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.orderService.getMyOrderDetail(+orderId).subscribe();
    }
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

  canCancel(): boolean {
    if (!this.order()) return false;
    const status = this.order()!.status;
    return status === OrderStatus.PROCESANDO || status === OrderStatus.CONFIRMADO;
  }

  cancelOrder(): void {
    if (!this.order()) return;

    this.confirmationService.confirmCustom(
      '¿Estás seguro de cancelar este pedido?',
      'Cancelar pedido',
      'pi pi-question-circle',
      () => {
        this.canceling.set(true);
        this.orderService.cancelMyOrder(this.order()!.id).subscribe({
          next: () => {
            this.canceling.set(false);
            this.alertService.success('Pedido cancelado', 'El pedido ha sido cancelado correctamente');
          },
          error: (error) => {
            this.canceling.set(false);
            this.alertService.error('Error', error.error?.message || 'Error al cancelar el pedido');
          }
        })
      },
    )
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

  getTimelineEvents(): any[] {
    if (!this.order() || !this.order()!.tracking) return [];

    return this.order()!.tracking.map(tracking => ({
      status: this.getStatusText(tracking.status),
      date: this.formatDate(tracking.created_at),
      note: tracking.note,
      icon: this.getTimelineIcon(tracking.status)
    }));
  }

  getTimelineIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PROCESANDO:
        return 'pi pi-spinner';
      case OrderStatus.CONFIRMADO:
        return 'pi pi-check-circle';
      case OrderStatus.ENVIADO:
        return 'pi pi-truck';
      case OrderStatus.EN_CAMINO:
        return 'pi pi-map';
      case OrderStatus.ENTREGADO:
        return 'pi pi-home';
      case OrderStatus.CANCELADO:
        return 'pi pi-times-circle';
      default:
        return 'pi pi-circle';
    }
  }
}
