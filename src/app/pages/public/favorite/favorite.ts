import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { CartService } from '../../../services/cart/cart.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule
  ],
  providers: [ConfirmationService],
  templateUrl: './favorite.html',
  styleUrls: ['./favorite.css']
})
export class Favorite implements OnInit {
  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationService);

  favorites = this.favoritesService.favorites;
  loading = this.favoritesService.loading;
  favoriteCount = this.favoritesService.favoriteCount;

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
  }

  removeFavorite(productId: number, productTitle: string): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${productTitle}" de favoritos?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.favoritesService.removeFavorite(productId).subscribe({
          next: () => {
            this.alertService.success('Eliminado', `${productTitle} eliminado de favoritos`);
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar de favoritos');
          }
        });
      }
    });
  }

  addToCart(productId: number, productTitle: string): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.alertService.success('Agregado al carrito', `${productTitle} agregado al carrito`);
      },
      error: (error) => {
        this.alertService.error('Error', error.error?.message || 'Error al agregar al carrito');
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
