import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../services/user/user.service';
import { AddressService } from '../../../services/address/address.service';
import { User } from '../../../assets/models/user/user.model';
import { Address } from '../../../assets/models/user/address.model';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AlertService } from '../../../services/alert/alert.service';
import { UpdateProfileRequest } from '../../../assets/models/user/user.model';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-profile',
  imports: [
    ButtonModule,
    FormsModule,
    CheckboxModule,
    DialogModule,
    InputMaskModule,
    DatePickerModule,
    PasswordModule,
    AvatarModule,
    SkeletonModule,
    TagModule,
    InputTextModule,
    TextareaModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private addressService = inject(AddressService);
  private messageService = inject(MessageService);
  private alertService = inject(AlertService);


  user = this.userService.user;
  loadingUser = this.userService.loading;
  addresses = this.addressService.addresses;
  loadingAddresses = this.addressService.loading;


  profileModel = {
    username: '',
    email: '',
    phone: '',
    birth_date: null as Date | null
  };

  passwordModel = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  addressModel = {
    id: null as number | null,
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
  };


  addressDialog = signal(false);
  editingAddress = signal(false);
  loading = signal(false);
  loadingPassword = signal(false);

  maxBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

  ngOnInit(): void {
    this.loadUserData();
    this.loadAddresses();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.populateProfileForm(user);
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo cargar la información del perfil');
      }
    });
  }

  populateProfileForm(user: User): void {
    this.profileModel = {
      username: user.username || '',
      email: user.email || '',
      phone: user.phone ? user.phone.toString() : '',
      birth_date: user.birth_date ? new Date(user.birth_date) : null
    };
  }

  userInitials(): string {
    const username = this.user()?.username;
    return username ? username.substring(0, 2).toUpperCase() : '??';
  }

  updateProfile(): void {
    this.loading.set(true);

    const updateData: UpdateProfileRequest = {
      username: this.profileModel.username,
      email: this.profileModel.email,
    };

    if (this.profileModel.phone) {
      const numericPhone = parseInt(this.profileModel.phone.replace(/\D/g, ''), 10);
      if (!isNaN(numericPhone)) updateData.phone = numericPhone;
    }

    if (this.profileModel.birth_date) {
      updateData.birth_date = this.profileModel.birth_date.toISOString().split('T')[0];
    }

    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        this.loading.set(false);
        this.alertService.success('Éxito', 'Perfil actualizado');
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error('Error', err.error?.message || 'Error al actualizar');
      }
    });
  }

  changePassword(): void {
    if (this.passwordModel.new_password !== this.passwordModel.confirm_password) {
      this.alertService.error('Error','Las contraseñas no coinciden');
      return;
    }

    this.loadingPassword.set(true);
    this.userService.changePassword({
      current_password: this.passwordModel.current_password,
      new_password: this.passwordModel.new_password
    }).subscribe({
      next: () => {
        this.loadingPassword.set(false);
        this.passwordModel = { current_password: '', new_password: '', confirm_password: '' };
        this.alertService.success('Éxito', 'Contraseña actualizada');
      },
      error: (err) => {
        this.loadingPassword.set(false);
        this.alertService.error('Error', err.error?.message || 'Error al cambiar contraseña');
      }
    });
  }

  resetPasswordForm(): void {
    this.passwordModel = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    };
  }

  loadAddresses(): void {
    this.addressService.getMyAddresses().subscribe({
      error: (error) => {
        this.alertService.error('Error', 'No se pudieron cargar las direcciones.');
      }
    });
  }

  openAddressDialog(address?: Address): void {
    if (address) {
      this.editingAddress.set(true);
      this.addressModel = {
        id: address.id,
        recipient_name: address.recipient_name,
        recipient_phone: address.recipient_phone,
        street: address.street,
        ext_number: address.ext_number,
        int_number: address.int_number || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        references: address.references || '',
        is_default: address.is_default
      };
    } else {
      this.editingAddress.set(false);
      this.resetAddressForm();
    }
    this.addressDialog.set(true);
  }

  closeAddressDialog(): void {
    this.addressDialog.set(false);
    this.resetAddressForm();
  }

  resetAddressForm(): void {
    this.addressModel = {
      id: null,
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
    };
  }

  saveAddress(): void {
    if (!this.isAddressFormValid()) {
      return;
    }

    this.loading.set(true);

    const addressData = {
      recipient_name: this.addressModel.recipient_name,
      recipient_phone: this.addressModel.recipient_phone,
      street: this.addressModel.street,
      ext_number: this.addressModel.ext_number,
      int_number: this.addressModel.int_number || undefined,
      neighborhood: this.addressModel.neighborhood,
      city: this.addressModel.city,
      state: this.addressModel.state,
      postal_code: this.addressModel.postal_code,
      references: this.addressModel.references || undefined,
      is_default: this.addressModel.is_default
    };

    const request = this.editingAddress() && this.addressModel.id
      ? this.addressService.updateAddress(this.addressModel.id, addressData)
      : this.addressService.createAddress(addressData);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.closeAddressDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editingAddress()
            ? 'Dirección actualizada correctamente'
            : 'Dirección creada correctamente'
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al guardar la dirección'
        });
      }
    });
  }

  isValidPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  isValidPostalCode(postalCode: string): boolean {
    return /^\d{5}$/.test(postalCode);
  }

  isAddressFormValidForSubmit(): boolean {
    // Verificar campos requeridos
    if (!this.addressModel.recipient_name) return false;
    if (!this.addressModel.recipient_phone) return false;
    if (!this.addressModel.street) return false;
    if (!this.addressModel.ext_number) return false;
    if (!this.addressModel.neighborhood) return false;
    if (!this.addressModel.city) return false;
    if (!this.addressModel.state) return false;
    if (!this.addressModel.postal_code) return false;

    // Verificar formato de teléfono
    if (!/^\d{10}$/.test(this.addressModel.recipient_phone)) return false;

    // Verificar formato de código postal
    if (!/^\d{5}$/.test(this.addressModel.postal_code)) return false;

    return true;
  }

  // Modifica el método isAddressFormValid() existente para que sea más simple
  isAddressFormValid(): boolean {
    if (!this.isAddressFormValidForSubmit()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos requeridos correctamente'
      });
      return false;
    }
    return true;
  }

  setDefaultAddress(addressId: number): void {
    this.loading.set(true);

    this.addressService.updateAddress(addressId, { is_default: true }).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Dirección predeterminada actualizada'
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al establecer dirección predeterminada'
        });
      }
    });
  }

  deleteAddress(addressId: number, addressName: string): void {
    this.messageService.add({
      key: 'confirm',
      severity: 'warn',
      summary: 'Confirmar eliminación',
      detail: `¿Estás seguro de eliminar la dirección de ${addressName}?`,
      sticky: true,
      data: { addressId }
    });
  }

  confirmDelete(addressId: number): void {
    this.loading.set(true);

    this.addressService.deleteAddress(addressId).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Dirección eliminada correctamente'
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al eliminar la dirección'
        });
      }
    });
  }
}
