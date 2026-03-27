import { Component, inject, signal, OnInit } from '@angular/core';
import { BannerCarouselComponent } from '../../../components/banner/banner.component';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProductService } from '../../../services/products/products.service';
import { SkeletonModule } from 'primeng/skeleton';
import { Product, OfferType } from '../../../assets/models/shop/product.model';
import { AlertService } from '../../../services/alert/alert.service';
import { CartService } from '../../../services/cart/cart.service';
import { FavoritesService } from '../../../services/favorite/favorite.service';

@Component({
  selector: 'app-landing',
  imports: [
    BannerCarouselComponent,
    ImageModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    CarouselModule,
    TagModule,
],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  private productService = inject(ProductService);
  private alertService = inject(AlertService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);

  products = signal<Product[]>([]);
  newProducts = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadingBestSellers();
    this.loadingNewProducts();
  }

  loadingBestSellers() {
    this.loading.set(true);

    this.productService.getBestSellers().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.alertService.error('Error', 'No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  loadingNewProducts() {
    this.loading.set(true);

    this.productService.getNewArrivals().subscribe({
      next: (products) => {
        this.newProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.alertService.error('Error', 'No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  getSeverity(product: Product): 'success' | 'warn' | 'danger' | 'info' {
    if (product.stock === 0) {
      return 'danger';
    } else if (product.stock < 10) {
      return 'warn';
    }
    return 'success';
  }

  getStockStatus(product: Product): string {
    if (product.stock === 0) {
      return 'Agotado';
    } else if (product.stock < 10) {
      return 'Stock bajo';
    }
    return 'En stock';
  }

  getDisplayPrice(product: Product): number {
    return product.final_price ?? product.price;
  }

  hasDiscount(product: Product): boolean {
    return !!product.final_price && product.final_price < product.price;
  }

  getOfferLabel(product: Product): string | undefined {
    if (!product.offer || !product.offer.is_active) return undefined;

    switch (product.offer.type) {
      case OfferType.PERCENTAGE:
        return `${product.offer.discount_value}% OFF`;
      case OfferType.FIXED_PRICE:
        return `Oferta: $${product.offer.discount_value}`;
      case OfferType.TWO_FOR_ONE:
        return `2x1`;
      case OfferType.BUNDLE:
        return `${product.offer.bundle_quantity} x $${product.offer.discount_value}`;
      default:
        return product.offer.label;
    }
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    if (product.stock === 0) {
      this.alertService.warn('Sin stock', 'Este producto no está disponible');
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.alertService.success('Agregado', `${product.title} agregado al carrito`);
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
