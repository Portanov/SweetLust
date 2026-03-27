import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { AddressService } from '../../../services/address/address.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    PasswordModule,
    DividerModule,
    DialogModule,
    TagModule,
    TextareaModule,
    CheckboxModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private addressService = inject(AddressService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationAlertService);

  loading = signal(false);
  addressDialog = signal(false);
  editingAddress = signal(false);
  selectedAddressId = signal<number | null>(null);

  user = this.userService.user;
  addresses = this.addressService.addresses;
  loadingUser = this.userService.loading;
  loadingAddresses = this.addressService.loading;

  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [null as number | null, [Validators.required, Validators.min(1000000000)]],
    birth_date: [null as Date | null, [Validators.required]]
  });

  passwordForm = this.fb.group({
    current_password: ['', [Validators.required, Validators.minLength(6)]],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  addressForm = this.fb.group({
    recipient_name: ['', [Validators.required, Validators.maxLength(100)]],
    recipient_phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    street: ['', [Validators.required, Validators.maxLength(255)]],
    ext_number: ['', [Validators.required, Validators.maxLength(20)]],
    int_number: ['', [Validators.maxLength(20)]],
    neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.required, Validators.maxLength(100)]],
    postal_code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    references: ['', [Validators.maxLength(500)]],
    is_default: [false]
  });

  ngOnInit(): void {
    this.loadUserData();
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('new_password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          phone: user.phone,
          birth_date: new Date(user.birth_date)
        });
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo cargar la información del perfil');
      }
    });
    this.addressService.getMyAddresses().subscribe();
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.profileForm.value;
    const data = {
      username: formValue.username!,
      email: formValue.email!,
      phone: formValue.phone!,
      birth_date: formValue.birth_date!.toISOString().split('T')[0]
    };

    this.userService.updateProfile(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.alertService.success('Perfil actualizado', 'Tus datos han sido actualizados correctamente');
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'Error al actualizar perfil');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.userService.changePassword({
      current_password: this.passwordForm.value.current_password!,
      new_password: this.passwordForm.value.new_password!
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.passwordForm.reset();
        this.alertService.success('Contraseña actualizada', 'Tu contraseña ha sido cambiada correctamente');
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'Error al cambiar contraseña');
      }
    });
  }

  openAddressDialog(address?: any): void {
    if (address) {
      this.editingAddress.set(true);
      this.selectedAddressId.set(address.id);
      this.addressForm.patchValue({
        recipient_name: address.recipient_name,
        recipient_phone: address.recipient_phone,
        street: address.street,
        ext_number: address.ext_number,
        int_number: address.int_number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        references: address.references,
        is_default: address.is_default
      });
    } else {
      this.editingAddress.set(false);
      this.selectedAddressId.set(null);
      this.addressForm.reset({
        recipient_name: '',
        recipient_phone: '',
        street: '',
        ext_number: '',
        int_number: '',
        neighborhood: '',
        city: '',
        state: '',
        postal_code: '',
        references: '',
        is_default: false
      });
    }
    this.addressDialog.set(true);
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.addressForm.value;

    const data: any = {
      recipient_name: formValue.recipient_name!,
      recipient_phone: formValue.recipient_phone!,
      street: formValue.street!,
      ext_number: formValue.ext_number!,
      neighborhood: formValue.neighborhood!,
      city: formValue.city!,
      state: formValue.state!,
      postal_code: formValue.postal_code!,
      is_default: formValue.is_default || false
    };

    if (formValue.int_number) {
      data.int_number = formValue.int_number;
    }
    if (formValue.references) {
      data.references = formValue.references;
    }

    if (this.editingAddress() && this.selectedAddressId()) {
      this.addressService.updateAddress(this.selectedAddressId()!, data).subscribe({
        next: () => {
          this.loading.set(false);
          this.addressDialog.set(false);
          this.alertService.success('Dirección actualizada', 'La dirección ha sido actualizada correctamente');
          this.addressService.refresh();
        },
        error: (error) => {
          this.loading.set(false);
          this.alertService.error('Error', error.error?.message || 'Error al actualizar dirección');
        }
      });
    } else {
      this.addressService.createAddress(data).subscribe({
        next: () => {
          this.loading.set(false);
          this.addressDialog.set(false);
          this.alertService.success('Dirección creada', 'La dirección ha sido creada correctamente');
          this.addressService.refresh();
        },
        error: (error) => {
          this.loading.set(false);
          this.alertService.error('Error', error.error?.message || 'Error al crear dirección');
        }
      });
    }
  }

  deleteAddress(id: number, recipientName: string): void {
    this.confirmationService.confirmDelete(
      `¿Estás seguro de eliminar la dirección de ${recipientName}?`,
      () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.alertService.success('Dirección eliminada', 'La dirección ha sido eliminada correctamente');
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar dirección');
          }
        });
      }
    );
  }

  setDefaultAddress(id: number): void {
    this.addressService.updateAddress(id, { is_default: true }).subscribe({
      next: () => {
        this.alertService.success('Dirección predeterminada', 'La dirección ha sido establecida como predeterminada');
      },
      error: (error) => {
        this.alertService.error('Error', error.error?.message || 'Error al establecer dirección predeterminada');
      }
    });
  }

  closeAddressDialog(): void {
    this.addressDialog.set(false);
    this.addressForm.reset({
      recipient_name: '',
      recipient_phone: '',
      street: '',
      ext_number: '',
      int_number: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: '',
      references: '',
      is_default: false
    });
  }
}
