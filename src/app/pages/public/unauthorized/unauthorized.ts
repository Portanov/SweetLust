import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800">
      <div class="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <i class="pi pi-ban text-6xl text-red-400 mb-4"></i>
        <h1 class="text-3xl font-bold text-white mb-2">Acceso No Autorizado</h1>
        <p class="text-gray-300 mb-6">No tienes permisos para acceder a esta página.</p>
        <div class="flex gap-4 justify-center">
          <a routerLink="/shop" pButton label="Ir a la Tienda" class="p-button-outlined p-button-secondary"></a>
          <a routerLink="/login" pButton label="Iniciar Sesión" class="p-button-primary"></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class Unauthorized { }
