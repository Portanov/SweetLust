import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products/products.service';
import { CartService } from '../../../services/cart/cart.service';
import { FavoritesService } from '../../../services/favorite/favorite.service';
import { AlertService } from '../../../services/alert/alert.service';
import { Product, OfferType, ProductCategory, CategoryWithCount, } from '../../../assets/models/shop/product.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SliderModule } from 'primeng/slider';
import { ChipModule } from 'primeng/chip';
import { CarouselModule } from 'primeng/carousel';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, Subject, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorState } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, InputTextModule,
    SkeletonModule, TagModule, TooltipModule,
    PaginatorModule, IconFieldModule, InputIconModule,
    SliderModule, ChipModule, CarouselModule, PanelModule, PopoverModule
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
  categories = signal<CategoryWithCount[]>([]);
  categoriesReady = signal(false);
  loading = signal(true);

  categoriesWithAll = computed(() => {
    const cats = this.categories();
    const total = cats.reduce((sum, c) => sum + c.count, 0);
    return [{ category: 'all' as const, count: total }, ...cats];
  });

  searchTerm = signal('');
  selectedCategory = signal<ProductCategory | 'all'>('all');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  onSaleOnly = signal(false);
  inStockOnly = signal(false);

  priceRange = signal<[number, number]>([0, 10000]);
  maxPossiblePrice = signal(10000);

  currentPage = signal(0);
  totalProducts = signal(0);
  readonly pageSize = 12;

  pagedProducts = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.allProducts().slice(start, start + this.pageSize);
  });

  private isLoadingProducts = false;
  private initialized = false;
  private searchSubject = new Subject<string>();
  OfferType = OfferType;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(0);
      this.loadProducts();
    });



    effect(() => {
      this.selectedCategory();
      this.minPrice();
      this.maxPrice();
      this.onSaleOnly();
      this.inStockOnly();

      if (this.initialized) {
        this.currentPage.set(0);
        this.loadProducts();
      }
    });
  }

  ngOnInit(): void {
    this.favoritesService.loadFavorites();

    forkJoin({
      categories: this.productService.getCategories(),
      products: this.productService.getProducts({}),
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories.set(categories);

        const maxP = Math.max(...products.products.map((p) => Number(p.price)), 1000);
        const rounded = Math.ceil(maxP / 100) * 100;
        this.maxPossiblePrice.set(rounded);
        this.priceRange.set([0, rounded]);

        this.allProducts.set(products.products);
        this.totalProducts.set(products.total);
        this.loading.set(false);
        this.categoriesReady.set(true);



        setTimeout(() => { this.initialized = true; }, 0);
      },
      error: () => {
        this.loading.set(false);
        this.categoriesReady.set(true);
        this.initialized = true;
        this.alertService.error('Error', 'Error al cargar los productos');
      },
    });
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategory() !== 'all' ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      this.onSaleOnly() ||
      this.inStockOnly() ||
      this.searchTerm() !== ''
    );
  }

  loadProducts(): void {
    if (this.isLoadingProducts) return;
    this.isLoadingProducts = true;
    this.loading.set(true);

    const filters: Record<string, unknown> = {};
    if (this.searchTerm()) filters['search'] = this.searchTerm();
    if (this.selectedCategory() !== 'all') filters['category'] = this.selectedCategory();
    if (this.minPrice() !== null) filters['minPrice'] = this.minPrice();
    if (this.maxPrice() !== null) filters['maxPrice'] = this.maxPrice();
    if (this.onSaleOnly()) filters['onSale'] = true;
    if (this.inStockOnly()) filters['inStock'] = true;

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.allProducts.set(response.products);
        this.totalProducts.set(response.total);
        this.loading.set(false);
        this.isLoadingProducts = false;
      },
      error: () => {
        this.allProducts.set([]);
        this.totalProducts.set(0);
        this.loading.set(false);
        this.isLoadingProducts = false;
        this.alertService.error('Error', 'Error al cargar los productos');
      },
    });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set(event.page ?? 0);
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchSubject.next('');
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  onCategorySelect(category: ProductCategory | 'all'): void {
    this.selectedCategory.set(category);
  }

  onPriceRangeChange(): void {
    this.minPrice.set(this.priceRange()[0]);
    this.maxPrice.set(this.priceRange()[1]);
  }

  resetFilters(): void {
    this.initialized = false;

    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.onSaleOnly.set(false);
    this.inStockOnly.set(false);
    this.priceRange.set([0, this.maxPossiblePrice()]);
    this.currentPage.set(0);

    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.value = '';


    setTimeout(() => {
      this.initialized = true;
      this.loadProducts();
    }, 0);
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

  isFavorite(productId: number): boolean { return this.favoritesService.isFavorite(productId); }
  getDisplayPrice(product: Product): number { return product.final_price ?? product.price; }
  hasDiscount(product: Product): boolean { return !!product.final_price && product.final_price < product.price; }
  onImageError(event: Event): void { (event.target as HTMLImageElement).src = 'assets/images/placeholder.png'; }

  getOfferLabel(product: Product): string {
    if (!product.offer) return '';
    switch (product.offer.type) {
      case OfferType.PERCENTAGE: return `${product.offer.discount_value}% OFF`;
      case OfferType.FIXED_PRICE: return `Liquidación`;
      case OfferType.TWO_FOR_ONE: return '2x1';
      case OfferType.BUNDLE: return `${product.offer.bundle_quantity} x $${product.offer.discount_value}`;
      default: return product.offer.label || 'Oferta';
    }
  }

  getOfferSeverity(product: Product): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    if (!product.offer) return 'info';
    switch (product.offer.type) {
      case OfferType.PERCENTAGE: return 'danger';
      case OfferType.TWO_FOR_ONE: return 'success';
      case OfferType.FIXED_PRICE: return 'warn';
      case OfferType.BUNDLE: return 'info';
      default: return 'secondary';
    }
  }

  getCategoryIcon(category: ProductCategory | 'all'): string {
    const icons: Record<string, string> = {
      [ProductCategory.DISFRACES]: 'pi pi-crown',
      [ProductCategory.VIBRADORES]: 'pi pi-venus',
      [ProductCategory.JUGUETES]: 'fa-solid fa-cubes-stacked',
      [ProductCategory.LENCERIA]: 'pi pi-heart',
      [ProductCategory.ACCESORIOS]: 'pi pi-shopping-bag',
      [ProductCategory.LUBRICANTES]: 'pi pi-bolt',
      [ProductCategory.CONDONES]: 'fa-solid fa-shield-heart',
      [ProductCategory.JUEGOS]: 'pi pi-star',
      [ProductCategory.ACEITES]: 'fa-solid fa-droplet',
      [ProductCategory.BONDAGE]: 'pi pi-mars',
      [ProductCategory.MASCARAS]: 'fa-solid fa-mask',
      [ProductCategory.MUÑECAS]: 'pi pi-user',
      [ProductCategory.OTROS]: 'pi pi-tag',
    };
    return icons[category] ?? 'pi pi-tag';
  }
}
