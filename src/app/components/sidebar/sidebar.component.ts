import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CartService } from '../../services/cart/cart.service';
import { toObservable } from '@angular/core/rxjs-interop';


interface MenuItem {
  icon: string;
  label: string;
  badge?: number;
  progress?: string;
  active?: boolean;
  link: string;
  roles?: ('admin' | 'client')[];
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    DrawerModule,
    RippleModule,
    AccordionModule,
    BadgeModule,
    TooltipModule,
    RouterLink,
  ],
  template: `
    <p-drawer
      #drawerRef
      [(visible)]="visible"
      appendTo="body"
      [modal]="true"
      position="left"
      [style]="{ width: '360px', border: 'none' }"
      styleClass="no-border-drawer"
    >
      <ng-template #headless>
        <div
          class="flex flex-col h-full bg-linear-to-tr from-[#0f0507] via-[#2d1119] to-[#461B27] text-white"
        >
          <div class="relative px-5 pt-8 pb-6 shrink-0 border-b border-white/10">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"
            ></div>
            <div class="flex items-center gap-3 group cursor-pointer relative">
              <div class="relative">
                <div
                  class="absolute inset-0 bg-pink-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"
                ></div>
                <img
                  src="images/SweetyLustLogowhite.png"
                  class="w-12 h-12 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
                <div
                  class="absolute -inset-1 bg-pink-400/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
              </div>
              <div class="flex flex-col">
                <span
                  class="text-4xl font-light tracking-widest bg-linear-to-r from-white via-pink-100 to-white bg-clip-text text-transparent font-logo"
                >
                  Sweety<span
                    class="bg-linear-to-r from-pink-300 to-pink-100 bg-clip-text text-transparent font-tropical"
                    >Lust</span
                  >
                </span>
                <span class="text-[10px] text-white/50 tracking-wider mt-0.5 nova-round-regular"
                  >Placer, dulce y pecado</span
                >
              </div>
            </div>
            <p-button
              type="button"
              (click)="closeCallback($event)"
              icon="pi pi-times"
              rounded="true"
              text="true"
              severity="secondary"
              styleClass="absolute top-6 right-2 !text-white/40 hover:!text-white/80 hover:!bg-white/10 !transition-all !w-8 !h-8"
            ></p-button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 font-caviar">
            <div class="space-y-2">
              <div class="px-4 mb-3 flex items-center gap-2">
                <i class="pi pi-home text-pink-400/60 text-xs"></i>
                <span class="text-xs font-medium text-white/50 tracking-wide uppercase"
                  >Navegación</span
                >
                <div class="flex-1 h-px bg-linear-to-r from-white/10 to-transparent"></div>
              </div>
              @for (item of publicItems; track item.label) {
                <a
                  pRipple
                  [class.active]="isActive(item.link)"
                  class="relative flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                  routerLink="{{ item.link }}"
                  routerLinkActive="active"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:via-pink-400/5 group-hover:to-transparent transition-all duration-500"
                  ></div>
                  <div class="relative">
                    <div
                      class="absolute inset-0 bg-pink-400/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    ></div>
                    <i
                      [class]="
                        item.icon +
                        ' text-lg group-hover:text-pink-300 transition-all duration-300 group-hover:scale-110'
                      "
                    ></i>
                  </div>
                  <span
                    class="font-medium text-sm group-hover:translate-x-0.5 transition-transform duration-300"
                    >{{ item.label }}</span
                  >
                  <span
                    *ngIf="item.badge"
                    class="ml-auto bg-linear-to-r from-pink-500/30 to-pink-400/20 text-pink-200 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10"
                    >{{ item.badge }}</span
                  >
                  <div
                    *ngIf="isActive(item.link)"
                    class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-pink-400 to-pink-300 rounded-r-full"
                  ></div>
                </a>
              }
            </div>

            <div *ngIf="authService.isLoggedIn() && !authService.isAdmin()" class="mt-6 space-y-2">
              <div class="px-4 mb-3 flex items-center gap-2">
                <i class="pi pi-user text-pink-400/60 text-xs"></i>
                <span class="text-xs font-medium text-white/50 tracking-wide uppercase"
                  >Mi cuenta</span
                >
                <div class="flex-1 h-px bg-linear-to-r from-white/10 to-transparent"></div>
              </div>
              <a
                *ngFor="let item of getAuthenticatedItems()"
                pRipple
                [class.active]="isActive(item.link)"
                class="relative flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                routerLink="{{ item.link }}"
                routerLinkActive="active"
              >
                <div
                  class="absolute inset-0 bg-linear-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:via-pink-400/5 group-hover:to-transparent transition-all duration-500"
                ></div>
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-pink-400/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  <i
                    [class]="
                      item.icon +
                      ' text-lg group-hover:text-pink-300 transition-all duration-300 group-hover:scale-110'
                    "
                  ></i>
                </div>
                <span
                  class="font-medium text-sm group-hover:translate-x-0.5 transition-transform duration-300"
                  >{{ item.label }}</span
                >
                <span
                  *ngIf="item.badge"
                  class="ml-auto bg-linear-to-r from-pink-500/30 to-pink-400/20 text-pink-200 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10"
                  >{{ item.badge }}</span
                >
                <div
                  *ngIf="isActive(item.link)"
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-pink-400 to-pink-300 rounded-r-full"
                ></div>
              </a>
            </div>

            <div *ngIf="authService.isLoggedIn() && authService.isAdmin()" class="mt-6 space-y-2">
              <div class="px-4 mb-3 flex items-center gap-2">
                <i class="pi pi-cog text-pink-400/60 text-xs"></i>
                <span class="text-xs font-medium text-white/50 tracking-wide uppercase"
                  >Administración</span
                >
                <div class="flex-1 h-px bg-linear-to-r from-white/10 to-transparent"></div>
              </div>
              <a
                *ngFor="let item of adminItems"
                pRipple
                [class.active]="isActive(item.link)"
                class="relative flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                routerLink="{{ item.link }}"
                routerLinkActive="active"
              >
                <div
                  class="absolute inset-0 bg-linear-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:via-pink-400/5 group-hover:to-transparent transition-all duration-500"
                ></div>
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-pink-400/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  <i
                    [class]="
                      item.icon +
                      ' text-lg group-hover:text-pink-300 transition-all duration-300 group-hover:scale-110'
                    "
                  ></i>
                </div>
                <span
                  class="font-medium text-sm group-hover:translate-x-0.5 transition-transform duration-300"
                  >{{ item.label }}</span
                >
                <div
                  *ngIf="isActive(item.link)"
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-pink-400 to-pink-300 rounded-r-full"
                ></div>
              </a>
            </div>

            <div class="my-6 px-4"></div>

            <div class="space-y-2">
              <div class="px-4 mb-3 flex items-center gap-2">
                <i class="pi pi-share-alt text-pink-400/60 text-xs"></i>
                <span class="text-xs font-medium text-white/50 tracking-wide uppercase"
                  >Enlaces Externos</span
                >
                <div class="flex-1 h-px bg-linear-to-r from-white/10 to-transparent"></div>
              </div>
              <a
                *ngFor="let item of collectionItems"
                [href]="item.link"
                target="_blank"
                pRipple
                class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <i [class]="item.icon + ' group-hover:text-pink-300 transition-colors text-sm'"></i>
                <span class="text-sm">{{ item.label }}</span>
              </a>
            </div>
          </div>

          <div class="mt-auto relative">
            <div
              class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-pink-400/30 to-transparent"
            ></div>

            <div
              *ngIf="authService.isLoggedIn()"
              class="m-4 p-1 flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:border-pink-400/30 transition-all duration-300 cursor-pointer group"
            >
              <p-avatar
                [label]="getUserInitials()"
                shape="circle"
                styleClass="border-2 border-pink-400/40"
                class="w-10 h-10"
              />
              <div class="flex-1">
                <div class="text-md group-hover:text-pink-200 transition-colors font-caviar">
                  {{ getUserName() }}
                </div>
                <div class="text-xs text-white/50">{{ getUserRole() }}</div>
              </div>
              <div class="flex gap-1 me-2">
                <i
                  class="pi pi-sign-out text-white/30 group-hover:text-white/60 transition-colors text-sm cursor-pointer hover:text-pink-300"
                  pTooltip="Cerrar sesión"
                  tooltipPosition="top"
                  (click)="onLogout()"
                ></i>
              </div>
            </div>

            <div
              *ngIf="!authService.isLoggedIn()"
              class="m-4 p-3 flex flex-col gap-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div class="text-center">
                <i class="pi pi-user text-3xl text-white/40 mb-2"></i>
                <p class="text-white/60 text-sm mb-3">Inicia sesión para acceder a más funciones</p>
                <div class="flex gap-2">
                  <a routerLink="/login" class="flex-1">
                    <p-button
                      label="Iniciar sesión"
                      styleClass="w-full !bg-pink-500/20 !border-pink-400/30 !text-pink-300 hover:!bg-pink-500/30"
                    />
                  </a>
                  <a routerLink="/register" class="flex-1">
                    <p-button
                      label="Registrarse"
                      styleClass="w-full !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </p-drawer>

    <p-button
      icon="pi pi-bars"
      [rounded]="true"
      [text]="true"
      styleClass="!text-white/80 hover:!text-pink-300 hover:!bg-white/10 !transition-all !w-10 !h-10 border-none"
      (onClick)="toggleDrawer()"
    ></p-button>
  `,
  styles: [
    `
      :host ::ng-deep .no-border-drawer .p-drawer {
        border: none !important;
        box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4) !important;
      }

      :host ::ng-deep .no-border-drawer .p-drawer-mask {
        backdrop-filter: blur(8px);
        background: rgba(0, 0, 0, 0.4);
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, rgba(236, 72, 153, 0.4), rgba(219, 39, 119, 0.2));
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(236, 72, 153, 0.6);
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes gentlePulse {
        0%,
        100% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
      }

      :host ::ng-deep .p-drawer-content {
        animation: slideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
      }

      .active {
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }

      .active i {
        color: #f472b6;
      }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  visible: boolean = false;

  authService = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);

  cartItemCount = this.cartService.count;
  cartItemCount$ = toObservable(this.cartItemCount);

  publicItems: MenuItem[] = [
    { icon: 'pi pi-home', label: 'Inicio', link: '/' },
    { icon: 'pi pi-shopping-bag', label: 'Tienda', link: '/shop' },
    { icon: 'pi pi-question-circle', label: 'Preguntas Frecuentes', link: '/questions' },
  ];

  authenticatedItems: MenuItem[] = [
    { icon: 'pi pi-shopping-cart', label: 'Mi Carrito', link: '/cart', badge: 0 },
    { icon: 'pi pi-heart', label: 'Mis Favoritos', link: '/favorites' },
    { icon: 'pi pi-user', label: 'Mi Perfil', link: '/profile' },
    { icon: 'pi pi-history', label: 'Mis Pedidos', link: '/orders' },
  ];

  adminItems: MenuItem[] = [
    { icon: 'pi pi-chart-line', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-users', label: 'Usuarios', link: '/admin/users' },
    { icon: 'pi pi-shopping-bag', label: 'Productos', link: '/admin/products' },
  ];

  collectionItems = [
    {
      icon: 'pi pi-globe',
      label: 'Guía IMSS',
      link: 'https://www.imss.gob.mx/sites/all/statics/salud/guias_salud/adolescentes/guiaadolesc_saludsexual.pdf',
    },
    { icon: 'pi pi-globe', label: 'Tienda Prudence', link: 'https://tienda.prudence.com.mx/' },
  ];

  toggleDrawer(): void {
    this.visible = true;
  }

  closeCallback(e: any): void {
    this.drawerRef.close(e);
  }

  onLogout(): void {
    this.authService.logout();
    this.visible = false;
    this.router.navigate(['/login']);
  }

  getAuthenticatedItems(): MenuItem[] {
    return this.authenticatedItems;
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

  ngOnInit(): void {
    this.cartItemCount$.subscribe(count => {
      const cartItem = this.authenticatedItems.find(item => item.link === '/cart');
      if (cartItem) {
        cartItem.badge = count;
      }
    });
  }
}
