import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products/products.service';
import { Product } from '../../../assets/models/shop/product.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TextareaModule } from 'primeng/textarea';
import { AlertService } from '../../../services/alert/alert.service';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';

@Component({
  selector: 'app-shop',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DialogModule,
    TableModule,
    ToolbarModule
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationAlertService);

  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);
  productDialog = false;
  isEditing = signal(false);
  selectedProductId: number | null = null;

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required]],
    image: ['', [Validators.required, Validators.pattern('https?://.+')]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 0, limit: number = 10): void {
    this.loading.set(true);
    this.productService.getProducts(page + 1, limit).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
        this.alertService.error('Error', 'No se pudieron cargar los productos');
      }
    });
  }

  loadProductsLazy(event: any): void {
    this.loadProducts(event.first / event.rows, event.rows);
  }

  openNew(): void {
    this.productForm.reset({
      title: '',
      description: '',
      image: '',
      price: 0,
      stock: 0
    });
    this.isEditing.set(false);
    this.selectedProductId = null;
    this.productDialog = true;
  }

  editProduct(product: Product): void {
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      image: product.image,
      price: Number(product.price),
      stock: product.stock
    });
    this.isEditing.set(true);
    this.selectedProductId = product.id;
    this.productDialog = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    const formValue = this.productForm.value;

    const productData = {
      title: formValue.title || undefined,
      description: formValue.description || undefined,
      image: formValue.image || undefined,
      price: formValue.price ?? undefined,
      stock: formValue.stock ?? undefined
    };

    if (this.isEditing() && this.selectedProductId) {
      this.productService.updateProduct(this.selectedProductId, productData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Producto actualizado correctamente');
          this.loadProducts();
          this.hideDialog();
        },
        error: (error) => {
          this.alertService.error('Error', 'Error al actualizar el producto');
        }
      });
    } else {
      const createData = {
        title: formValue.title!,
        description: formValue.description!,
        image: formValue.image!,
        price: formValue.price!,
        stock: formValue.stock!
      };

      this.productService.createProduct(createData).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Producto creado correctamente');
          this.loadProducts();
          this.hideDialog();
        },
        error: (error) => {
          this.alertService.error('Error', 'Error al crear el producto');
        }
      });
    }
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirmDelete(
      `¿Estás seguro de eliminar el producto "${product.title}"?`,
      () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.alertService.success('Éxito', 'Producto eliminado correctamente');
            this.loadProducts();
          },
          error: (error) => {
            this.alertService.error('Error', 'Error al eliminar el producto');
          }
        });
      }
    );
  }

  hideDialog(): void {
    this.productDialog = false;
    this.productForm.reset();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}
