import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../services/cart/cart.service';
import { AddressService } from '../../../services/address/address.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from "@angular/forms";
import { AlertService } from '../../../services/alert/alert.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Address } from '../../../assets/models/user/address.model';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';
import { DataViewModule } from 'primeng/dataview';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';

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
    FormsModule,
    DialogModule,
    InputTextModule,
    RadioButtonModule,
    DataViewModule,
    CheckboxModule,
    ScrollPanelModule,
    PanelModule,
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private addressService = inject(AddressService);
  private confirmationService = inject(ConfirmationAlertService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  loading = signal(false);
  checkoutDialog = signal(false);
  selectedAddress = signal<Address | null>(null);

  addresses = this.addressService.addresses;
  loadingAddresses = this.addressService.loading;

  items = this.cartService.items;
  total = this.cartService.total;
  itemCount = this.cartService.count;

  ngOnInit(): void {
    this.cartService.loadCart();
    this.addressService.getMyAddresses().subscribe();
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;

    this.loading.set(true);
    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', 'No pudimos actualizar el stock');
        this.cartService.loadCart();
      }
    });
  }

  removeItem(itemId: number): void {
    this.confirmationService.confirmDelete(
      '¿Estás seguro de eliminar este producto del carrito?',
      () => {
        this.loading.set(true);
        this.cartService.removeCartItem(itemId).subscribe({
          next: () => {
            this.loading.set(false);
            this.alertService.success('Producto eliminado', 'Producto eliminado del carrito');
          },
          error: (error) => {
            this.loading.set(false);
            this.alertService.error('Error', error.error?.message || 'Error al eliminar el producto');
          }
        });
      }
    );
  }

  clearCart(): void {
    this.confirmationService.confirmDelete(
      '¿Estás seguro de vaciar todo el carrito?',
      () => {
        this.loading.set(true);
        this.cartService.clearCart().subscribe({
          next: () => {
            this.loading.set(false);
            this.alertService.success('Carrito vaciado', 'El carrito ha sido vaciado correctamente');
          },
          error: (error) => {
            this.loading.set(false);
            this.alertService.error('Error', error.error?.message || 'Error al vaciar el carrito');
          }
        });
      }
    );
  }

  openCheckoutDialog(): void {
    if (this.items().length === 0) {
      this.alertService.warn('Carrito vacío', 'Agrega productos al carrito antes de continuar');
      return;
    }

    this.addressService.getMyAddresses().subscribe({
      next: () => {
        if (this.addresses().length === 0) {
          this.alertService.warn('Sin dirección', 'Por favor agrega una dirección de envío antes de continuar');
          this.router.navigate(['/profile']);
          return;
        }

        const defaultAddr = this.addresses().find(addr => addr.is_default);
        if (defaultAddr) {
          this.selectedAddress.set(defaultAddr);
        } else {
          this.selectedAddress.set(this.addresses()[0]);
        }

        this.checkoutDialog.set(true);
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.alertService.error('Error', 'No se pudieron cargar las direcciones');
      }
    });
  }

  confirmCheckout(): void {
    if (!this.selectedAddress()) {
      this.alertService.warn('Dirección requerida', 'Por favor selecciona una dirección de envío');
      return;
    }

    this.confirmationService.confirmCustom(
      '¿Confirmas realizar la compra?',
      'Confirmar compra',
      'pi pi-shopping-cart',
      () => {
        this.loading.set(true);
        this.cartService.checkout({
          addressId: this.selectedAddress()!.id
        }).subscribe({
          next: (response) => {
            this.loading.set(false);
            this.checkoutDialog.set(false);
            this.alertService.success(
              'Compra realizada',
              `Tu compra #${response.orderId} se ha realizado con éxito. ¡Gracias por tu preferencia!`
            );
            setTimeout(() => {
              this.router.navigate(['/orders', response.orderId]);
            }, 2000);
          },
          error: (error) => {
            this.loading.set(false);
            this.alertService.error('Error', error.error?.message || 'Error al procesar la compra');
          }
        });
      }
    );
  }

  goToAddAddress(): void {
    this.checkoutDialog.set(false);
    this.router.navigate(['/profile']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
