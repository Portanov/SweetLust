import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SupportService } from '../../../services/support/support.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, InputTextModule, TextareaModule],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);
  private readonly alertService = inject(AlertService);

  loading = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    subject: ['', [Validators.required, Validators.maxLength(160)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.form.getRawValue();

    this.supportService.createReport({
      name: payload.name ?? '',
      email: payload.email ?? '',
      phone: payload.phone || undefined,
      subject: payload.subject ?? '',
      message: payload.message ?? '',
    }).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.alertService.success('Reporte enviado', 'Tu mensaje fue registrado correctamente.');
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error', error.error?.message || 'No se pudo enviar el reporte');
      },
    });
  }

}
