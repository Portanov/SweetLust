import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../services/auth/auth.service';

interface AdminMenuItem {
  icon: string;
  label: string;
  link: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-siderbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TooltipModule, AvatarModule],
  host: {
    class: 'block shrink-0 transition-all duration-300',
    '[style.width.px]': 'collapsed ? 72 : 290',
  },
  template: `
    <aside
      class="h-screen bg-linear-to-b from-[#2a0d18] via-[#3b1321] to-[#5a2134] text-white border-r border-white/10 flex flex-col"
    >
      <div class="border-b border-white/10" [class.p-4]="!collapsed" [class.p-3]="collapsed">
        <div class="flex items-center gap-3 min-w-0" [class.justify-center]="collapsed">
          <div class="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center shrink-0">
            <i class="pi pi-chart-bar text-white/80"></i>
          </div>

          @if (!collapsed) {
            <div class="min-w-0">
              <p class="text-3xl leading-tight font-logo text-pink-50 tracking-wide truncate py-0.5">SweetyLust</p>
            </div>
          }
        </div>
      </div>

      <div class="flex-1 py-5 overflow-y-auto font-caviar" [class.py-4]="collapsed">
        @if (!collapsed) {
          <p class="px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-white/45 uppercase mb-3">Menú</p>
        }

        <nav
          [class.space-y-1.5]="!collapsed"
          [class.space-y-2.5]="collapsed"
          [class.px-3]="!collapsed"
          [class.px-2]="collapsed"
        >
          @for (item of adminItems; track item.link) {
            <a
              [routerLink]="item.link"
              [class.active]="isActive(item.link)"
              class="group relative flex items-center gap-3 rounded-xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 overflow-hidden"
              [class.justify-center]="collapsed"
              [class.px-4]="!collapsed"
              [class.py-3]="!collapsed"
              [class.p-2.5]="collapsed"
              [class.mx-0.5]="collapsed"
              pTooltip="{{ collapsed ? item.label : '' }}"
              tooltipPosition="right"
            >
              <div
                class="absolute inset-0 bg-linear-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:via-pink-400/5 group-hover:to-transparent transition-all duration-500"
              ></div>

              <i
                [class]="
                  item.icon +
                  ' relative text-lg transition-colors duration-300 ' +
                  (isActive(item.link) ? 'text-pink-200' : 'text-white/70 group-hover:text-pink-200')
                "
              ></i>

              @if (!collapsed) {
                <span class="relative font-medium text-sm group-hover:translate-x-0.5 transition-transform duration-300">{{ item.label }}</span>
              }

              @if (item.badge && !collapsed) {
                <span class="ml-auto rounded-full bg-pink-300/20 text-pink-100 text-xs font-semibold px-2 py-0.5">
                  {{ item.badge }}
                </span>
              }

              @if (item.badge && collapsed) {
                <span class="absolute right-2 top-2 w-2.5 h-2.5 rounded-full bg-pink-400 border border-[#3b1321]"></span>
              }
            </a>
          }
        </nav>
      </div>

      <div class="border-t border-white/10" [class.p-3]="!collapsed" [class.p-2]="collapsed">
        <div
          class="m-1 p-1 flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-pink-400/30 transition-all duration-300 group"
          [class.justify-center]="collapsed"
          [class.m-0]="collapsed"
        >
          <p-avatar
            [label]="getUserInitials()"
            shape="circle"
            class="border-2 border-pink-400/40 w-10 h-10"
          />

          @if (!collapsed) {
            <div class="min-w-0 flex-1">
              <p class="text-md group-hover:text-pink-200 transition-colors font-caviar truncate">{{ getUserName() }}</p>
              <p class="text-xs text-white/50 truncate">{{ getUserRole() }}</p>
            </div>

            <i
              class="pi pi-sign-out text-white/40 group-hover:text-white/70 transition-colors text-sm cursor-pointer hover:text-pink-300 me-2"
              (click)="onLogout()"
              pTooltip="Cerrar sesión"
              tooltipPosition="top"
            ></i>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .active {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
      }
    `,
  ],
})
export class AdminSiderbarComponent {
  @Input() collapsed = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  adminItems: AdminMenuItem[] = [
    { icon: 'pi pi-th-large', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-users', label: 'Usuarios', link: '/admin/users' },
    { icon: 'pi pi-shopping-cart', label: 'Pedidos', link: '/admin/orders' },
    { icon: 'pi pi-box', label: 'Productos', link: '/admin/products' },
    { icon: 'pi pi-headphones', label: 'Soporte', link: '/admin/support', badge: 2 },
  ];

  onLogout(): void {
    this.authService.logout();
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.username || 'Usuario';
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user?.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  }

  getUserRole(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.role === 'admin' ? 'Administrador' : 'Cliente';
  }

  isActive(link: string): boolean {
    const currentUrl = this.router.url;
    if (!currentUrl || !link) return false;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}
