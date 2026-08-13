import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateReportRequest,
  SupportFilters,
  Support,
  SupportResponse,
  UpdateReportRequest,
  DailyReportByDay,
} from '../../assets/models/support/support.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private http = inject(HttpClient);

  // -----------------------------------------
  // Rutas Publicas
  // -----------------------------------------

  createReport(report: CreateReportRequest): Observable<boolean> {
    return this.http.post<boolean>(`${API_URL}/support/create`, report);
  }

  // ----------------------------------------
  // Rutas de admin
  // ----------------------------------------

  getReports(filters?: SupportFilters): Observable<SupportResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<SupportResponse>(`${API_URL}/admin/support`, { params });
  }

  getReportById(id: number): Observable<Support> {
    return this.http.get<Support>(`${API_URL}/admin/support/${id}`);
  }

  createAdminReport(report: CreateReportRequest): Observable<boolean> {
    return this.http.post<boolean>(`${API_URL}/admin/support/generate`, report);
  }

  updateReportStatus(payload: UpdateReportRequest): Observable<boolean> {
    return this.http.put<boolean>(`${API_URL}/admin/support/respond`, payload);
  }

  deleteReport(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${API_URL}/admin/support/${id}`);
  }

  /** Obtiene reportes activos por día del mes actual, incluyendo días sin reportes */
  getDailyReportsCurrentMonth(): Observable<DailyReportByDay[]> {
    return this.http.get<DailyReportByDay[]>(`${API_URL}/admin/support/stats/daily-reports-current-month`);
  }
}
