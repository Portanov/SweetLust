import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, SidebarComponent],
  template: `
    <div class="fixed top-0 w-full z-50">
      <p-menubar class="rounded-none bg-black/60 backdrop-blur-md border-b border-white/5 p-3">
        <ng-template #start>
          <div class="flex items-center gap-3">
            <app-sidebar></app-sidebar>
            <div class="h-6 w-px bg-white/20 mx-1"></div>
            <h1
              class="text-white font-logo text-2xl tracking-widest m-0 bg-linear-to-r from-white to-pink-300 bg-clip-text"
            >
              Sweety Lust
            </h1>
          </div>
        </ng-template>
        <!--
        <ng-template #end>
          <p-button
            icon="pi pi-search"
            [rounded]="true"
            [text]="true"
            styleClass="!text-white/80 hover:!text-white hover:!bg-white/10"
          ></p-button>
        </ng-template>
        -->
      </p-menubar>
    </div>
  `,
  styleUrls: [],
})
export class HeaderComponent {}
