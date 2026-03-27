import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest
} from '../../assets/models/user/address.model';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);

  private addressesSignal = signal<Address[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly addresses = this.addressesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /**
   * Obtener todas las direcciones del usuario
   */
  getMyAddresses(): Observable<Address[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Address[]>(`${API_URL}/addresses`).pipe(
      tap({
        next: (addresses) => {
          this.addressesSignal.set(addresses);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al cargar direcciones');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Crear nueva dirección
   */
  createAddress(data: CreateAddressRequest): Observable<Address> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<Address>(`${API_URL}/addresses`, data).pipe(
      tap({
        next: (newAddress) => {
          this.addressesSignal.update(addresses => [...addresses, newAddress]);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al crear dirección');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Actualizar dirección
   */
  updateAddress(id: number, data: UpdateAddressRequest): Observable<Address> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<Address>(`${API_URL}/addresses/${id}`, data).pipe(
      tap({
        next: (updatedAddress) => {
          this.addressesSignal.update(addresses =>
            addresses.map(addr => addr.id === id ? updatedAddress : addr)
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al actualizar dirección');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Eliminar dirección
   */
  deleteAddress(id: number): Observable<{ message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ message: string }>(`${API_URL}/addresses/${id}`).pipe(
      tap({
        next: () => {
          this.addressesSignal.update(addresses => addresses.filter(addr => addr.id !== id));
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Error al eliminar dirección');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Obtener dirección por defecto
   */
  getDefaultAddress(): Address | undefined {
    return this.addressesSignal().find(addr => addr.is_default);
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Recargar direcciones
   */
  refresh(): void {
    this.getMyAddresses().subscribe();
  }
}
