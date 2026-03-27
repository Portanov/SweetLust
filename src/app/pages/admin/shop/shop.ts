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
import { ToolbarModule } from 'primeng/toolbar';
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
    ToolbarModule,
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
  first = signal(0);
  rows = signal(10);

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
    label: ['', [Validators.required, Validators.maxLength(100)]],
    discount_value: [null as number | null],
    bundle_quantity: [null as number | null],
    is_active: [true],
    starts_at: [null as Date | null],
    ends_at: [null as Date | null]
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  pagedProducts = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.products().slice(start, end);
  });

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.total.set(response.products.length);

        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', 'No se pudieron cargar los productos');
      }
    });
  }

  onPageChange(event: any): void {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  loadProductsLazy(event: any): void {
    this.loadProducts();
  }

  onSearch(event: any): void {
    const query = event.target.value;
    this.loading.set(true);
    this.productService.getProducts(query).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.total.set(response.total);
        this.first.set(0);
        this.loading.set(false);
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
      price: formValue.price!,
      stock: formValue.stock!
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

  openOfferDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.selectedOffer.set(null);
    this.offerForm.reset({
      type: OfferType.PERCENTAGE,
      label: '',
      discount_value: null,
      bundle_quantity: null,
      is_active: true,
      starts_at: null,
      ends_at: null
    });
    this.offerDialog.set(true);
  }

  editOffer(offer: Offer, product: Product): void {
    this.selectedProduct.set(product);
    this.selectedOffer.set(offer);
    this.offerForm.patchValue({
      type: offer.type,
      label: offer.label,
      discount_value: offer.discount_value,
      bundle_quantity: offer.bundle_quantity,
      is_active: offer.is_active,
      starts_at: offer.starts_at ? new Date(offer.starts_at) : null,
      ends_at: offer.ends_at ? new Date(offer.ends_at) : null
    });
    this.offerDialog.set(true);
  }

  saveOffer(): void {
    if (this.offerForm.invalid || !this.selectedProduct()) return;

    const formValue = this.offerForm.value;

    const offerData: any = {
      type: formValue.type!,
      label: formValue.label!,
      is_active: !!formValue.is_active,
      discount_value: formValue.discount_value ?? undefined,
      bundle_quantity: formValue.bundle_quantity ?? undefined,
      starts_at: formValue.starts_at ?? undefined,
      ends_at: formValue.ends_at ?? undefined
    };

    if (this.selectedOffer()) {
      this.productService.updateOffer(this.selectedOffer()!.id, offerData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Oferta actualizada');
          this.loadProducts();
          this.offerDialog.set(false);
        }
      });
    } else {
      this.productService.createOffer(this.selectedProduct()!.id, offerData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Oferta creada');
          this.loadProducts();
          this.offerDialog.set(false);
        }
      });
    }
  }

  deactivateOffer(offer: Offer, product: Product): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de desactivar esta oferta?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deactivateOffer(offer.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Oferta desactivada correctamente');
            this.loadProducts();
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
      message: `¿Estás seguro de eliminar esta oferta?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteOffer(offer.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Oferta eliminada correctamente');
            this.loadProducts();
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }

  hideDialogs(): void {
    this.productDialog.set(false);
    this.offerDialog.set(false);
  }
}
