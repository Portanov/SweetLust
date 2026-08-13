import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ConfirmationAlertService } from '../../../services/confirmationAlert/confirmation-alert.service';
import { UserRole } from '../../../assets/models/user/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    DialogModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PasswordModule,
    SelectModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsers implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationAlertService);

  users = this.userService.users;
  loading = this.userService.loading;

  userDialog = signal(false);
  editingUser = signal(false);
  selectedUserId = signal<number | null>(null);
  searchValue = '';
  selectedRole: UserRole | null = null;

  roleOptions = [
    { label: 'Cliente', value: UserRole.CLIENT },
    { label: 'Administrador', value: UserRole.ADMIN }
  ];

  userForm = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [null as number | null, [Validators.required, Validators.min(1000000000)]],
    birth_date: [null as Date | null, [Validators.required]],
    role: ['client', [Validators.required]]
  });

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe();
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'client':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'client':
        return 'Cliente';
      default:
        return role;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX');
  }

  openNewUser(): void {
    this.userForm.reset({ role: 'client' });
    this.userForm.get('username')?.enable();
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);

    this.editingUser.set(false);
    this.selectedUserId.set(null);
    this.userDialog.set(true);
  }

  editUser(user: any): void {
    this.editingUser.set(true);
    this.selectedUserId.set(user.id);

    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
      birth_date: new Date(user.birth_date),
      role: user.role
    });

    this.userForm.get('username')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.userDialog.set(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.value;
    const userData = {
      username: formValue.username!,
      email: formValue.email!,
      password: formValue.password!,
      phone: formValue.phone!,
      birth_date: formValue.birth_date!.toISOString().split('T')[0],
      role: formValue.role as UserRole
    };

    if (this.editingUser() && this.selectedUserId()) {
      this.userService.updateUserRole(this.selectedUserId()!, userData.role).subscribe({
        next: () => {
          this.userDialog.set(false);
          this.alertService.success('Usuario actualizado', 'El rol del usuario ha sido actualizado');
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al actualizar usuario');
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.userDialog.set(false);
          this.alertService.success('Usuario creado', 'El usuario ha sido creado correctamente');
        },
        error: (error) => {
          this.alertService.error('Error', error.error?.message || 'Error al crear usuario');
        }
      });
    }
  }

  updateRole(userId: number, currentRole: string): void {
    const newRole = (currentRole === UserRole.ADMIN ? UserRole.CLIENT : UserRole.ADMIN) as UserRole;
    const roleText = newRole === UserRole.ADMIN ? 'Administrador' : 'Cliente';

    this.confirmationService.confirmCustom(
      `¿Estás seguro de cambiar el rol de este usuario a ${roleText}?`,
      'Confirmar cambio de rol',
      'pi pi-exclamation-triangle',
      () => {
        this.userService.updateUserRole(userId, newRole).subscribe({
          next: () => {
            this.alertService.success('Rol actualizado', `El rol ha sido cambiado a ${roleText}`);
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al cambiar rol');
          }
        });
      }
    );
  }

  deleteUser(user: any): void {
    this.confirmationService.confirmDelete(
      `¿Estás seguro de eliminar al usuario "${user.username}"?`,
      () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.alertService.success('Usuario eliminado', 'El usuario ha sido eliminado correctamente');
          },
          error: (error) => {
            this.alertService.error('Error', error.error?.message || 'Error al eliminar usuario');
          }
        });
      }
    );
  }

  closeDialog(): void {
    this.userDialog.set(false);
    this.userForm.reset({
      username: '',
      email: '',
      password: '',
      phone: null,
      birth_date: null,
      role: 'client'
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  }
}
