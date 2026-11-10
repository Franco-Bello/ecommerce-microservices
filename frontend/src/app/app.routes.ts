import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart-view/cart-view.component').then((m) => m.CartViewComponent),
  },
  {
    path: 'invoices/my-invoices',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/invoices/my-invoices/my-invoices.component').then(
        (m) => m.MyInvoicesComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/invoices/admin-invoices/admin-invoices.component').then(
            (m) => m.AdminInvoicesComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];