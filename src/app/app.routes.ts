import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { authGuard, authMatchGuard, guestGuard } from './guards/auth-guard/auth.guard';
import { adminGuard, adminMatchGuard } from './guards/admin-guard/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/public/landing/landing').then((m) => m.Landing),
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('./pages/public/shop/shop').then((m) => m.Shop),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./pages/public/questions/questions').then((m) => m.Questions),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/public/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/public/favorite/favorite').then((m) => m.Favorite),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/public/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/public/orders/orders').then((m) => m.Orders),
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/public/order-detail/order-detail').then((m) => m.OrderDetail),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/public/support/support').then((m) => m.Support),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/public/map/map').then((m) => m.Map),
      },
    ],
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register/register').then((m) => m.Register),
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/public/unauthorized/unauthorized').then(
        (m) => m.Unauthorized
      ),
  },

  {
    path: 'admin',
    component: AdminLayout,
    canMatch: [adminMatchGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'orders',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/orders/orders').then((m) => m.Orders)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/users/users').then((m) => m.AdminUsers),
      },
      {
        path: 'products',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/shop/shop').then((m) => m.Shop),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/admin/support/support').then((m) => m.AdminSupport),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
