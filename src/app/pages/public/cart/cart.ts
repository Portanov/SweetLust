import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart/cart.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputNumberModule,
    DividerModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule
],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  loading = signal(false);

  items = this.cartService.items;
  total = this.cartService.total;
  itemCount = this.cartService.count;

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  updateQuantity(itemId: number, event: any): void {
    const quantity = event.value || event;
    if (quantity < 1) {
      this.removeItem(itemId);
      return;
    }

    this.loading.set(true);
    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Carrito actualizado',
          detail: 'Cantidad actualizada correctamente'
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar el carrito'
        });
      }
    });
  }

  removeItem(itemId: number): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este producto del carrito?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        this.cartService.removeCartItem(itemId).subscribe({
          next: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Producto eliminado',
              detail: 'Producto eliminado del carrito'
            });
          },
          error: (error) => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al eliminar el producto'
            });
          }
        });
      }
    });
  }

  clearCart(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de vaciar todo el carrito?',
      header: 'Vaciar carrito',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        this.cartService.clearCart().subscribe({
          next: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Carrito vaciado',
              detail: 'El carrito ha sido vaciado correctamente'
            });
          },
          error: (error) => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al vaciar el carrito'
            });
          }
        });
      }
    });
  }

  checkout(): void {
    if (this.items().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'Agrega productos al carrito antes de continuar'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Confirmas realizar la compra?',
      header: 'Confirmar compra',
      icon: 'pi pi-shopping-cart',
      accept: () => {
        this.loading.set(true);
        this.cartService.checkout().subscribe({
          next: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Compra realizada',
              detail: 'Tu compra se ha realizado con éxito. ¡Gracias por tu preferencia!'
            });
            setTimeout(() => {
              // this.router.navigate(['/orders']);
            }, 2000);
          },
          error: (error) => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al procesar la compra'
            });
          }
        });
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
