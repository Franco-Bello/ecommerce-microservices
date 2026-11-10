import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Brand / Logo -->
          <div class="flex items-center gap-8">
            <a routerLink="/products" class="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-400 hover:text-emerald-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>TechStore</span>
            </a>

            <!-- Enlaces Principales -->
            <nav class="hidden md:flex items-center gap-1">
              <a
                routerLink="/products"
                routerLinkActive="bg-slate-800 text-emerald-400"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Catálogo
              </a>

              @if (authService.isAuthenticated()) {
                <a
                  routerLink="/invoices/my-invoices"
                  routerLinkActive="bg-slate-800 text-emerald-400"
                  class="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  Mis Compras
                </a>

                @if (authService.isAdmin()) {
                  <div class="h-4 w-[1px] bg-slate-700 mx-2"></div>
                  <a
                    routerLink="/admin/users"
                    routerLinkActive="bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    class="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800 transition"
                  >
                    Usuarios (Admin)
                  </a>
                  <a
                    routerLink="/admin/invoices"
                    routerLinkActive="bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    class="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800 transition"
                  >
                    Facturación Global
                  </a>
                }
              }
            </nav>
          </div>

          <!-- Acciones Derecha (Carrito + Usuario / Login) -->
          <div class="flex items-center gap-4">
            @if (authService.isAuthenticated()) {
              <!-- Botón Carrito -->
              <a
                routerLink="/cart"
                routerLinkActive="bg-slate-800 text-emerald-400"
                class="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Ver Carrito"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                @if (cartService.totalItems() > 0) {
                  <span class="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {{ cartService.totalItems() }}
                  </span>
                }
              </a>

              <!-- Perfil de Usuario -->
              <a
                routerLink="/profile"
                routerLinkActive="ring-2 ring-emerald-400"
                class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition text-sm"
              >
                <span class="font-medium text-slate-100">{{ authService.currentUser()?.name }}</span>
                @if (authService.isAdmin()) {
                  <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ADMIN
                  </span>
                } @else {
                  <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    USER
                  </span>
                }
              </a>

              <!-- Cerrar Sesión -->
              <button
                type="button"
                (click)="onLogout()"
                class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            } @else {
              <a
                routerLink="/auth/login"
                routerLinkActive="bg-slate-800 text-white"
                class="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition"
              >
                Iniciar Sesión
              </a>
              <a
                routerLink="/auth/register"
                class="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg transition shadow-sm"
              >
                Crear Cuenta
              </a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly notify = inject(NotificationService);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }
  }

  async onLogout(): Promise<void> {
    const confirmed = await this.notify.confirm(
      '¿Cerrar sesión?',
      'Se cerrará tu sesión actual en este dispositivo.',
      'Sí, salir'
    );
    if (confirmed) {
      this.cartService.resetLocalCart();
      this.authService.logout();
    }
  }
}