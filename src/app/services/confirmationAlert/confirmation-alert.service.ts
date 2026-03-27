import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  accept?: () => void;
  reject?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationAlertService {
  private confirmationService = inject(ConfirmationService);

  /**
   * 1. Confirmación básica
   * Uso: confirmBasic('¿Estás seguro?', () => { ... })
   */
  confirmBasic(message: string, onAccept: () => void, onReject?: () => void) {
    this.confirmationService.confirm({
      message: message,
      header: 'Confirmar',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onAccept,
      reject: onReject
    });
  }

  /**
   * 2. Confirmación para eliminar
   * Uso: confirmDelete('¿Eliminar este producto?', () => { ... })
   */
  confirmDelete(message: string, onAccept: () => void, onReject?: () => void) {
    this.confirmationService.confirm({
      message: message,
      header: 'Eliminar',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onAccept,
      reject: onReject
    });
  }

  /**
   * 3. Confirmación personalizada (con icono, header y mensaje personalizados)
   * Uso: confirmCustom('¿Continuar?', 'Acción importante', 'pi pi-info-circle', () => { ... })
   */
  confirmCustom(
    message: string,
    header: string,
    icon: string,
    onAccept: () => void,
    onReject?: () => void,
    options?: {
      acceptLabel?: string;
      rejectLabel?: string;
      acceptButtonStyleClass?: string;
      rejectButtonStyleClass?: string;
    }
  ) {
    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: icon,
      acceptLabel: options?.acceptLabel || 'Aceptar',
      rejectLabel: options?.rejectLabel || 'Cancelar',
      acceptButtonStyleClass: options?.acceptButtonStyleClass || 'p-button-primary',
      rejectButtonStyleClass: options?.rejectButtonStyleClass || 'p-button-secondary',
      accept: onAccept,
      reject: onReject
    });
  }

  /**
   * Método alternativo con objeto de opciones (más flexible)
   */
  confirmWithOptions(options: ConfirmOptions) {
    const defaultOptions = {
      header: 'Confirmar',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      ...options
    };

    this.confirmationService.confirm(defaultOptions);
  }

  /**
   * Versión async para usar con async/await
   */
  async confirmAsync(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const defaultOptions = {
        header: 'Confirmar',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Aceptar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-primary',
        rejectButtonStyleClass: 'p-button-secondary',
        ...options,
        accept: () => {
          if (options.accept) options.accept();
          resolve(true);
        },
        reject: () => {
          if (options.reject) options.reject();
          resolve(false);
        }
      };

      this.confirmationService.confirm(defaultOptions);
    });
  }
}
