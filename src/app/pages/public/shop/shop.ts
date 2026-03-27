import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products/products.service';
import { CartService } from '../../../services/cart/cart.service';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { AlertService } from '../../../services/alert/alert.service';
import { Product, OfferType } from '../../../assets/models/shop/product.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css'],
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private alertService = inject(AlertService);

  allProducts = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(0);
  readonly pageSize = 10;


  pagedProducts = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.allProducts().slice(start, start + this.pageSize);
  });

  total = computed(() => this.allProducts().length);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.searchTerm()).subscribe({
      next: (response) => {
        this.allProducts.set(response.products);
        this.loading.set(false);
      },
      error: () => {
        this.allProducts.set([]);
        this.loading.set(false);
        this.alertService.error('Error', 'Error al cargar los productos');
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page ?? 0);
    const productGrid = document.querySelector('.p-16');
    productGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchSubject.next('');
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.alertService.warn('Sin stock', 'Este producto no está disponible');
      return;
    }
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => this.alertService.success('Agregado', `${product.title} agregado al carrito`),
      error: (err) => this.alertService.error('Error', err.error?.message || 'Error al agregar'),
    });
  }

  toggleFavorite(productId: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(productId).subscribe({
      next: () => {
        const isFav = this.favoritesService.isFavorite(productId);
        this.alertService.success(
          isFav ? 'Agregado' : 'Eliminado',
          isFav ? 'Agregado a favoritos' : 'Eliminado de favoritos',
        );
      },
      error: (err) => this.alertService.error('Error', err.error?.message || 'Error'),
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  getOfferLabel(product: Product): string {
    if (!product.offer?.is_active) return '';
    switch (product.offer.type) {
      case OfferType.PERCENTAGE: return `${product.offer.discount_value}% OFF`;
      case OfferType.FIXED_PRICE: return `Oferta: $${product.offer.discount_value}`;
      case OfferType.TWO_FOR_ONE: return '2x1';
      case OfferType.BUNDLE: return `${product.offer.bundle_quantity} x $${product.offer.discount_value}`;
      default: return product.offer.label;
    }
  }

  getOfferSeverity(product: Product): 'success' | 'danger' | 'warn' | 'info' {
    switch (product.offer?.type) {
      case OfferType.PERCENTAGE: return 'danger';
      case OfferType.TWO_FOR_ONE: return 'success';
      default: return 'warn';
    }
  }

  getDisplayPrice(product: Product): number {
    return product.final_price ?? product.price;
  }

  hasDiscount(product: Product): boolean {
    return !!product.final_price && product.final_price < product.price;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.png';
  }
}
