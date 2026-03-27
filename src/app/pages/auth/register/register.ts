import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private alertService = inject(AlertService);

  loading = signal(false);

  maxDate = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  );

  form = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    phone: [null as number | null, [Validators.required, Validators.min(1000000000)]],
    birth_date: [null as Date | null, Validators.required],
  });

  get username() { return this.form.get('username'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get phone() { return this.form.get('phone'); }
  get birth_date() { return this.form.get('birth_date'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { username, email, password, phone, birth_date } = this.form.value;

    const birthDateObj = birth_date as Date;
    const adjustedDate = new Date(
      birthDateObj.getTime() - birthDateObj.getTimezoneOffset() * 60000
    );
    const birthDateStr = adjustedDate.toISOString().split('T')[0];

    this.authService.register({
      username: username!,
      email: email!,
      password: password!,
      phone: phone!,
      birth_date: birthDateStr,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.alertService.success('Éxito', res.message);
        setTimeout(() => void this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error('Error', err?.error?.message ?? 'Ocurrió un error, intenta de nuevo.');
      },
    });
  }
}
