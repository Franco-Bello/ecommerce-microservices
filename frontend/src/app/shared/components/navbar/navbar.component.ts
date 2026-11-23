import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800 print:hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Brand / Logo + Enlaces Desktop -->
          <div class="flex items-center gap-8">
            <a
              routerLink="/products"
              (click)="closeMobileMenu()"
              class="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-400 hover:text-emerald-300 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>TechStore</span>
            </a>

            <!-- Enlaces Principales (Desktop) -->
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

          <!-- Acciones Derecha (Tema + Carrito + Usuario/Auth + Botón Hamburguesa) -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Botón Modo Claro / Oscuro -->
            <button
              type="button"
              (click)="themeService.toggleTheme()"
              class="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
              [title]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              @if (themeService.isDark()) {
                <!-- Ícono Sol (pasar a claro) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <!-- Ícono Luna (pasar a oscuro) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>

            @if (authService.isAuthenticated()) {
              <!-- Botón Carrito (siempre visible) -->
              <a
                routerLink="/cart"
                (click)="closeMobileMenu()"
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

              <!-- Perfil de Usuario (Desktop) -->
              <a
                routerLink="/profile"
                routerLinkActive="ring-2 ring-emerald-400"
                class="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition text-sm"
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

              <!-- Cerrar Sesión (Desktop) -->
              <button
                type="button"
                (click)="onLogout()"
                class="hidden md:inline-flex p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            } @else {
              <div class="hidden md:flex items-center gap-3">
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
              </div>
            }

            <!-- Botón Menú Hamburguesa (Solo Móvil) -->
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              [attr.aria-expanded]="mobileMenuOpen()"
              aria-label="Abrir menú de navegación"
            >
              @if (mobileMenuOpen()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Menú Desplegable Móvil -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-4 space-y-2 shadow-xl">
          <a
            routerLink="/products"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-slate-800 text-emerald-400"
            class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Catálogo
          </a>

          @if (authService.isAuthenticated()) {
            <a
              routerLink="/invoices/my-invoices"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-slate-800 text-emerald-400"
              class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Mis Compras
            </a>

            <a
              routerLink="/profile"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-slate-800 text-emerald-400"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span>Mi Perfil ({{ authService.currentUser()?.name }})</span>
              <span
                class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                [class.bg-amber-500/20]="authService.isAdmin()"
                [class.text-amber-300]="authService.isAdmin()"
                [class.bg-emerald-500/20]="!authService.isAdmin()"
                [class.text-emerald-300]="!authService.isAdmin()"
              >
                {{ authService.currentUser()?.role }}
              </span>
            </a>

            @if (authService.isAdmin()) {
              <div class="pt-2 mt-2 border-t border-slate-800 space-y-1">
                <span class="block px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Administración
                </span>
                <a
                  routerLink="/admin/users"
                  (click)="closeMobileMenu()"
                  routerLinkActive="bg-amber-500/20 text-amber-300"
                  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800 transition"
                >
                  Usuarios (Admin)
                </a>
                <a
                  routerLink="/admin/invoices"
                  (click)="closeMobileMenu()"
                  routerLinkActive="bg-amber-500/20 text-amber-300"
                  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800 transition"
                >
                  Facturación Global
                </a>
              </div>
            }

            <div class="pt-2 mt-2 border-t border-slate-800">
              <button
                type="button"
                (click)="onLogout()"
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          } @else {
            <div class="pt-2 mt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <a
                routerLink="/auth/login"
                (click)="closeMobileMenu()"
                class="text-center px-3 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Iniciar Sesión
              </a>
              <a
                routerLink="/auth/register"
                (click)="closeMobileMenu()"
                class="text-center px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition"
              >
                Crear Cuenta
              </a>
            </div>
          }
        </div>
      }
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly themeService = inject(ThemeService);
  private readonly notify = inject(NotificationService);

  readonly mobileMenuOpen = signal(false);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  async onLogout(): Promise<void> {
    this.closeMobileMenu();
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