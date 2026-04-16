import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    PanelModule
  ],
  template: `
    <p-panel class="rounded-none bg-zinc-900 border-t border-zinc-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 py-4 px-6">
        <div class="text-center md:text-left">
          <h1 class="font-logo text-3xl tracking-widest text-white m-0">Sweety Lust</h1>
          <p class="text-zinc-200 text-md mt-2 alumni-sans">Tu refugio de placer y fantasias.</p>
        </div>

        <div class="flex gap-6">
          <a href="#" class="text-zinc-400 hover:text-pink-500 transition-colors">
            <i class="pi pi-instagram text-xl"></i>
          </a>
          <a href="#" class="text-zinc-400 hover:text-pink-500 transition-colors">
            <i class="pi pi-facebook text-xl"></i>
          </a>
          <a href="#" class="text-zinc-400 hover:text-pink-500 transition-colors">
            <i class="pi pi-twitter text-xl"></i>
          </a>
          <a href="#" class="text-zinc-400 hover:text-pink-500 transition-colors">
            <i class="pi pi-whatsapp text-xl"></i>
          </a>
        </div>

        <div class="text-center md:text-right alumni-sans">
          <p class="text-zinc-200 m-0 text-md">© 2024 Sweety Lust</p>
          <p class="text-zinc-300 m-0 text-sm mt-1">Todos los derechos reservados</p>
        </div>
      </div>
    </p-panel>
  `,
  styleUrls: [],
})
export class FooterComponent {}
