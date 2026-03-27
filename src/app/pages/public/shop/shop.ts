// src/pages/public/shop/shop.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products/products.service';
import { CartService } from '../../../services/cart/cart.service';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { AlertService } from '../../../services/alert/alert.service';
import { Product, OfferType } from '../../../assets/models/shop/product.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private alertService = inject(AlertService);

  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');

  ngOnInit(): void {
    this.loadProducts();
    this.favoritesService.loadFavorites();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm()
    ).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.loadProducts();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.alertService.warn('Sin stock', 'Este producto no está disponible');
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.alertService.success('Agregado al carrito', `${product.title} ha sido agregado al carrito`);
      },
      error: (error) => {
        this.alertService.error('Error', error.error?.message || 'Error al agregar al carrito');
      }
    });
  }

  toggleFavorite(productId: number, event: Event): void {
    event.stopPropagation();

    this.favoritesService.toggleFavorite(productId).subscribe({
      next: () => {
        const isFavorite = this.favoritesService.isFavorite(productId);
        this.alertService.success(
          isFavorite ? 'Agregado' : 'Eliminado',
          isFavorite ? 'Producto agregado a favoritos' : 'Producto eliminado de favoritos'
        );
      },
      error: (error) => {
        this.alertService.error('Error', error.error?.message || 'Error al actualizar favoritos');
      }
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  getOfferLabel(product: Product): string | null {
    if (!product.offer || !product.offer.is_active) return null;

    const offer = product.offer;
    switch (offer.type) {
      case OfferType.PERCENTAGE:
        return `${offer.discount_value}% OFF`;
      case OfferType.FIXED_PRICE:
        return `Oferta: $${offer.discount_value}`;
      case OfferType.TWO_FOR_ONE:
        return `2x1`;
      case OfferType.BUNDLE:
        return `${offer.bundle_quantity} x $${offer.discount_value}`;
      default:
        return offer.label;
    }
  }

  getOfferSeverity(product: Product): 'success' | 'danger' | 'warn' | 'info' {
    if (!product.offer) return 'info';

    switch (product.offer.type) {
      case OfferType.PERCENTAGE:
        return 'danger';
      case OfferType.TWO_FOR_ONE:
        return 'success';
      default:
        return 'warn';
    }
  }

  getDisplayPrice(product: Product): number {
    return product.final_price ?? product.price;
  }

  hasDiscount(product: Product): boolean {
    return !!product.final_price && product.final_price < product.price;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
