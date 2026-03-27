import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  loading = signal(false);
  showPinForm = signal(false);
  tempToken = signal<string | null>(null);
  userEmail = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  pinForm = this.fb.group({
    pin: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.loginFirstStep({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.tempToken.set(res.temp_token);
        this.userEmail.set(email!);
        this.showPinForm.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error('Error', err?.error?.message ?? 'Credenciales inválidas');
      },
    });
  }

  onPinSubmit(): void {
    if (this.pinForm.invalid) {
      this.pinForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.verifyPin({
      email: this.userEmail()!,
      pin: this.pinForm.value.pin!,
      temp_token: this.tempToken()!,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
          this.alertService.success('Éxito', 'Sesión iniciada con éxito');
        } else {
          this.router.navigate(['/shop']);
          this.alertService.success('Éxito', 'Sesión iniciada con éxito');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error('Error', err?.error?.message ?? 'PIN inválido o expirado');

        if (err?.error?.message?.includes('inválido')) {
          this.pinForm.reset();
        }
      },
    });
  }

  resendPin(): void {
    if (!this.userEmail()) return;

    this.loading.set(true);
    const { password } = this.loginForm.value;

    this.authService.loginFirstStep({
      email: this.userEmail()!,
      password: password!
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.tempToken.set(res.temp_token);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error('Error', 'Error al reenviar el PIN');
      }
    });
  }
}
