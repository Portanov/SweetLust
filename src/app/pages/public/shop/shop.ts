import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products/products.service';
import { Product } from '../../../assets/models/shop/product.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '../../../services/cart/cart.service';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-shop',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoritesService);
  private alertService = inject(AlertService);

  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');

  ngOnInit(): void {
    this.loadProducts();
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
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

  isFavorite(productId: number): boolean{
    return this.favoriteService.isFavorite(productId);
  }

  toggleFavorite(productId: number, event: Event): void {
    event.stopPropagation();

    this.favoriteService.toggleFavorite(productId).subscribe({
      next: () => {
        const isNowFavorite = this.favoriteService.isFavorite(productId);
        this.alertService.success(
          isNowFavorite ? 'Agregado' : 'Eliminado',
          isNowFavorite
            ? 'Producto agregado a favoritos'
            : 'Producto eliminado de favoritos'
        );
      },
      error: (error) => {
        this.alertService.error('Error', error.error?.message || 'Error al actualizar favoritos');
      }
    });
  }
}
