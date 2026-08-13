import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { SupportService } from '../../../services/support/support.service';
import { AlertService } from '../../../services/alert/alert.service';
import {
  CreateReportRequest,
  ReportStatus,
  Support as SupportReport,
  SupportFilters,
} from '../../../assets/models/support/support.model';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    TooltipModule,
  ],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class AdminSupport implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  reports = signal<SupportReport[]>([]);
  total = signal(0);
  loading = signal(false);

  detailDialog = signal(false);
  createDialog = signal(false);
  updateDialog = signal(false);
  selectedReport = signal<SupportReport | null>(null);
  selectedDetailReport = signal<SupportReport | null>(null);

  readonly statusOptions = [
    { label: 'Pendiente', value: ReportStatus.PENDING },
    { label: 'Revisado', value: ReportStatus.REVIEWED },
    { label: 'Cerrado', value: ReportStatus.CLOSED },
  ];

  readonly searchForm = this.fb.group({
    search: [''],
    status: [null as ReportStatus | null],
  });

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    subject: ['', [Validators.required, Validators.maxLength(160)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly updateForm = this.fb.group({
    reportId: [0, [Validators.required]],
    status: [ReportStatus.PENDING, [Validators.required]],
  });

  ngOnInit(): void {
    this.setupFilterListeners();
    this.loadReports();
  }

  private setupFilterListeners(): void {
    this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.loadReports();
    });

    this.searchForm.controls.status.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.loadReports();
    });
  }

  loadReports(): void {
    this.loading.set(true);
    const filters = this.buildFilters();

    this.supportService.getReports(filters).subscribe({
      next: (response) => {
        this.reports.set(response.reports);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'No se pudieron cargar los reportes');
      },
    });
  }

  openCreateDialog(): void {
    this.createForm.reset();
    this.createDialog.set(true);
  }

  openDetailDialog(report: SupportReport): void {
    this.loading.set(true);
    this.supportService.getReportById(report.id).subscribe({
      next: (detail) => {
        this.selectedDetailReport.set(detail);
        this.detailDialog.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'No se pudo cargar el reporte');
      },
    });
  }

  openUpdateDialog(report: SupportReport): void {
    this.selectedReport.set(report);
    this.updateForm.patchValue({
      reportId: report.id,
      status: report.status,
    });
    this.updateDialog.set(true);
  }

  createReport(): void {
    if (this.createForm.invalid || this.loading()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.getRawValue();
    const payload: CreateReportRequest = {
      name: formValue.name ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone || undefined,
      subject: formValue.subject ?? '',
      message: formValue.message ?? '',
    };

    this.loading.set(true);
    this.supportService.createAdminReport(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.createDialog.set(false);
        this.alertService.success('Reporte creado', 'El reporte fue registrado correctamente.');
        this.loadReports();
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'No se pudo crear el reporte');
      },
    });
  }

  updateReport(): void {
    if (this.updateForm.invalid || this.loading()) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const formValue = this.updateForm.getRawValue();
    if (!formValue.reportId) return;

    this.loading.set(true);
    this.supportService.updateReportStatus({
      reportId: formValue.reportId,
      status: formValue.status as ReportStatus,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.updateDialog.set(false);
        this.alertService.success('Reporte actualizado', 'El estado se actualizó correctamente.');
        this.loadReports();
      },
      error: (error) => {
        this.loading.set(false);
        this.alertService.error('Error', error.error?.message || 'No se pudo actualizar el reporte');
      },
    });
  }

  clearFilters(): void {
    this.searchForm.reset({ search: '', status: null }, { emitEvent: false });
    this.loadReports();
  }

  closeDetailDialog(): void {
    this.detailDialog.set(false);
    this.selectedDetailReport.set(null);
  }

  closeCreateDialog(): void {
    this.createDialog.set(false);
  }

  closeUpdateDialog(): void {
    this.updateDialog.set(false);
    this.selectedReport.set(null);
  }

  getSeverity(status: ReportStatus | string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case ReportStatus.PENDING:
        return 'warn';
      case ReportStatus.REVIEWED:
        return 'info';
      case ReportStatus.CLOSED:
        return 'success';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: ReportStatus | string): string {
    switch (status) {
      case ReportStatus.PENDING:
        return 'Pendiente';
      case ReportStatus.REVIEWED:
        return 'Revisado';
      case ReportStatus.CLOSED:
        return 'Cerrado';
      default:
        return status;
    }
  }

  formatDate(value: string | Date): string {
    return new Date(value).toLocaleString('es-MX');
  }

  private buildFilters(): SupportFilters {
    const value = this.searchForm.getRawValue();
    return {
      search: value.search?.trim() || undefined,
      status: value.status || undefined,
    };
  }

}
