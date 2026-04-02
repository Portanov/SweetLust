import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { CartService } from '../../../services/cart/cart.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PaginatorModule } from 'primeng/paginator';
import { OfferType } from '../../../assets/models/shop/product.model';
import { Product } from '../../../assets/models/shop/product.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    ChipModule,
    TagModule,
    ScrollPanelModule,
    PaginatorModule
  ],
  templateUrl: './favorite.html',
  styleUrls: ['./favorite.css']
})
export class Favorite implements OnInit {
  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationAlertService);

  favorites = this.favoritesService.favorites;
  loading = this.favoritesService.loading;
  favoriteCount = this.favoritesService.favoriteCount;

  // Paginación
  itemsPerPage = 10; // 2 filas × 5 productos
  currentPage = signal(0);

  paginatedFavorites = computed(() => {
    const favorites = this.favorites();
    const start = this.currentPage() * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return favorites.slice(start, end);
  });

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
  }

  removeFavorite(productId: number, productTitle: string): void {
    this.confirmationService.confirmDelete(
      `¿Estás seguro de eliminar "${productTitle}" de favoritos?`,
      () => {
        this.favoritesService.removeFavorite(productId).subscribe({
          next: () => {
            this.alertService.success('Eliminado', `${productTitle} eliminado de favoritos`);
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar de favoritos');
          }
        });
      }
    );
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

  getOfferLabel(product: Product): string {
    if (!product.offer?.is_active) return '';
    switch (product.offer.type) {
      case OfferType.PERCENTAGE: return `${product.offer.discount_value}% OFF`;
      case OfferType.FIXED_PRICE: return `Liquidación`;
      case OfferType.TWO_FOR_ONE: return '2x1';
      case OfferType.BUNDLE: return `${product.offer.bundle_quantity} x $${product.offer.discount_value}`;
      default: return product.offer.label || 'Oferta';
    }
  }
}
