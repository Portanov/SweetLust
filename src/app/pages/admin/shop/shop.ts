import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products/products.service';
import { Product, Offer, OfferType } from '../../../assets/models/shop/product.model';
import { AlertService } from '../../../services/alert/alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DatePickerModule,
    DialogModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    SelectModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    CheckboxModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);
  productDialog = signal(false);
  offerDialog = signal(false);
  isEditing = signal(false);
  selectedProductId = signal<number | null>(null);
  selectedProduct = signal<Product | null>(null);
  selectedOffer = signal<Offer | null>(null);
  existingOffers = signal<Offer[]>([]);
  showOffersList = signal(false);
  searchValue = '';
  selectedStockFilter: 'available' | 'low' | 'out' | null = null;
  selectedOfferFilter: 'offer' | 'temporary' | 'permanent' | 'none' | null = null;

  tableProducts = computed(() => this.products().map((product) => ({
    ...product,
    stockFilter: this.getStockFilter(product),
    offerFilter: this.getOfferFilter(product),
  })));

  stockFilterOptions = [
    { label: 'Disponible', value: 'available' },
    { label: 'Stock bajo', value: 'low' },
    { label: 'Agotado', value: 'out' },
  ];

  offerFilterOptions = [
    { label: 'Con oferta', value: 'offer' },
    { label: 'Temporal', value: 'temporary' },
    { label: 'Permanente', value: 'permanent' },
    { label: 'Sin oferta', value: 'none' },
  ];

  offerTypes = [
    { label: 'Porcentaje de descuento', value: OfferType.PERCENTAGE },
    { label: 'Precio fijo', value: OfferType.FIXED_PRICE },
    { label: '2x1', value: OfferType.TWO_FOR_ONE },
    { label: 'Bundle (paquete)', value: OfferType.BUNDLE }
  ];

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required]],
    image: ['', [Validators.required, Validators.pattern('https?://.+')]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  offerForm = this.fb.group({
    type: [OfferType.PERCENTAGE, [Validators.required]],
    label: ['', [Validators.required, Validators.maxLength(200)]],
    discount_value: [null as number | null],
    bundle_quantity: [null as number | null],
    starts_at: [null as Date | null],
    ends_at: [null as Date | null]
  });

  // Exponer OfferType para usar en el template
  protected readonly OfferType = OfferType;

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Carga productos - el backend ya devuelve offer = null si no hay oferta activa
   */
  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.total.set(response.total || response.products.length);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', 'No se pudieron cargar los productos');
        console.error(error);
      }
    });
  }

  /**
   * Verifica si un producto tiene oferta activa
   */
  hasActiveOffer(product: Product): boolean {
    return product.offer !== null && product.offer !== undefined;
  }

  /**
   * Obtiene la oferta activa del producto (puede ser null)
   */
  getActiveOffer(product: Product): Offer | null {
    return product.offer || null;
  }

  /**
   * Verifica si una oferta es permanente
   */
  isPermanentOffer(offer: Offer | null | undefined): boolean {
    if (!offer) return false;
    return offer.is_active === true && !offer.ends_at;
  }

  /**
   * Verifica si una oferta es temporal (con fecha de expiración)
   */
  isTemporaryOffer(offer: Offer | null | undefined): boolean {
    if (!offer) return false;
    return offer.is_active === null && !!offer.ends_at;
  }

  /**
   * Verifica si una oferta temporal está vigente
   */
  isTemporaryOfferActive(offer: Offer): boolean {
    if (!this.isTemporaryOffer(offer)) return false;
    const now = new Date();
    const started = !offer.starts_at || new Date(offer.starts_at) <= now;
    const notEnded = new Date(offer.ends_at!) >= now;
    return started && notEnded;
  }

  /**
   * Recarga las ofertas de un producto específico
   */
  loadProductOffers(productId: number): void {
    this.productService.getOffersByProduct(productId).subscribe({
      next: (offers) => {
        this.existingOffers.set(offers);
      },
      error: (error) => {
        console.error('Error al cargar ofertas del producto:', error);
      }
    });
  }

  openNewProduct(): void {
    this.productForm.reset({
      title: '',
      description: '',
      image: '',
      price: 0,
      stock: 0
    });
    this.isEditing.set(false);
    this.selectedProductId.set(null);
    this.productDialog.set(true);
  }

  getStockFilter(product: Product): 'available' | 'low' | 'out' {
    if (product.stock <= 0) {
      return 'out';
    }

    if (product.stock < 10) {
      return 'low';
    }

    return 'available';
  }

  getOfferFilter(product: Product): 'offer' | 'temporary' | 'permanent' | 'none' {
    if (!product.offer) {
      return 'none';
    }

    if (this.isPermanentOffer(product.offer)) {
      return 'permanent';
    }

    if (this.isTemporaryOffer(product.offer)) {
      return 'temporary';
    }

    return 'offer';
  }

  editProduct(product: Product): void {
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
      stock: product.stock
    });
    this.isEditing.set(true);
    this.selectedProductId.set(product.id);
    this.productDialog.set(true);
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value;
    const productData = {
      title: formValue.title!,
      description: formValue.description!,
      image: formValue.image!,
      price: Number(formValue.price!),
      stock: Number(formValue.stock!)
    };

    if (this.isEditing() && this.selectedProductId()) {
      this.productService.updateProduct(this.selectedProductId()!, productData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Producto actualizado correctamente');
          this.loadProducts();
          this.productDialog.set(false);
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al actualizar el producto');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Producto creado correctamente');
          this.loadProducts();
          this.productDialog.set(false);
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al crear el producto');
        }
      });
    }
  }

  /**
   * Abre el diálogo para crear una nueva oferta
   */
  openOfferDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.selectedOffer.set(null);
    this.showOffersList.set(false);

    this.productService.getOffersByProduct(product.id).subscribe({
      next: (offers) => {
        this.existingOffers.set(offers);
        if (offers.length > 0) {
          this.showOffersList.set(true);
        }
      },
      error: (error) => {
        console.error('Error al cargar ofertas:', error);
      }
    });

    this.offerForm.reset({
      type: OfferType.PERCENTAGE,
      label: '',
      discount_value: null,
      bundle_quantity: null,
      starts_at: null,
      ends_at: null
    });
    this.offerDialog.set(true);
  }

  /**
   * Abre el diálogo para editar una oferta existente
   */
  editOffer(offer: Offer, product: Product): void {
    this.selectedProduct.set(product);
    this.selectedOffer.set(offer);
    this.showOffersList.set(false);

    this.offerForm.patchValue({
      type: offer.type,
      label: offer.label,
      discount_value: offer.discount_value,
      bundle_quantity: offer.bundle_quantity,
      starts_at: offer.starts_at ? new Date(offer.starts_at) : null,
      ends_at: offer.ends_at ? new Date(offer.ends_at) : null
    });
    this.offerDialog.set(true);
  }

  saveOffer(): void {
    if (this.offerForm.invalid || !this.selectedProduct()) return;

    const formValue = this.offerForm.value;
    const hasEndDate = !!formValue.ends_at;

    // Validar fechas
    if (formValue.starts_at && formValue.ends_at) {
      if (new Date(formValue.starts_at) >= new Date(formValue.ends_at)) {
        this.alertService.error('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }
    }

    // Construir el objeto según la lógica del backend
    const offerData: any = {
      type: formValue.type!,
      label: formValue.label!,
      discount_value: formValue.discount_value ?? undefined,
      bundle_quantity: formValue.bundle_quantity ?? undefined,
      starts_at: formValue.starts_at ? this.formatDateToISO(formValue.starts_at) : undefined,
    };

    // Si tiene fecha de fin -> oferta temporal (is_active = null)
    if (hasEndDate) {
      offerData.ends_at = this.formatDateToISO(formValue.ends_at!);
      offerData.is_active = null;
    } else {
      // Oferta permanente (is_active = true, ends_at = null)
      offerData.ends_at = null;
      offerData.is_active = true;
    }

    if (this.selectedOffer()) {
      // Actualizar oferta existente
      this.productService.updateOffer(this.selectedOffer()!.id, offerData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Oferta actualizada correctamente');
          this.loadProducts();
          this.offerDialog.set(false);
          this.selectedOffer.set(null);
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al actualizar la oferta');
        }
      });
    } else {
      // Crear nueva oferta
      this.productService.createOffer(this.selectedProduct()!.id, offerData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Oferta creada correctamente');
          this.loadProducts();
          this.offerDialog.set(false);
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al crear la oferta');
        }
      });
    }
  }

  /**
   * Formatea una fecha a ISO string para enviar al backend
   */
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  deactivateOffer(offer: Offer, product: Product): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de desactivar la oferta "${offer.label}"?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deactivateOffer(offer.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Oferta desactivada correctamente');
            this.loadProducts();
            this.offerDialog.set(false);
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al desactivar la oferta');
          }
        });
      }
    });
  }

  deleteOffer(offer: Offer): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar permanentemente la oferta "${offer.label}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteOffer(offer.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Oferta eliminada correctamente');
            this.loadProducts();
            this.offerDialog.set(false);
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar la oferta');
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el producto "${product.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Producto eliminado correctamente');
            this.loadProducts();
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar el producto');
          }
        });
      }
    });
  }

  getOfferTypeLabel(type: OfferType): string {
    switch (type) {
      case OfferType.PERCENTAGE: return 'Porcentaje';
      case OfferType.FIXED_PRICE: return 'Precio fijo';
      case OfferType.TWO_FOR_ONE: return '2x1';
      case OfferType.BUNDLE: return 'Bundle';
      default: return type;
    }
  }

  getOfferDescription(offer: Offer): string {
    switch (offer.type) {
      case OfferType.PERCENTAGE:
        return `${offer.discount_value}% de descuento`;
      case OfferType.FIXED_PRICE:
        return `Precio fijo: $${offer.discount_value}`;
      case OfferType.TWO_FOR_ONE:
        return `Lleva 2 y paga 1`;
      case OfferType.BUNDLE:
        return `${offer.bundle_quantity} unidades por $${offer.discount_value}`;
      default:
        return offer.label;
    }
  }

  getOfferSeverity(offer: Offer): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (this.isPermanentOffer(offer)) return 'success';
    if (this.isTemporaryOffer(offer)) {
      const now = new Date();
      const endsAt = new Date(offer.ends_at!);
      const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) return 'danger';
      if (daysLeft <= 7) return 'warn';
      return 'info';
    }
    return 'secondary';
  }

  formatOfferDate(date: Date | string | null): string {
    if (!date) return 'Sin fecha límite';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }

  hideDialogs(): void {
    this.productDialog.set(false);
    this.offerDialog.set(false);
    this.selectedOffer.set(null);
    this.showOffersList.set(false);
  }
}