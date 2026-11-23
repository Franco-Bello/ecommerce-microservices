import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb / Volver -->
      <div class="mb-6">
        <a
          routerLink="/products"
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al Catálogo</span>
        </a>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-pulse space-y-6">
          <div class="h-8 bg-slate-200 rounded w-1/2"></div>
          <div class="h-4 bg-slate-200 rounded w-full"></div>
          <div class="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      } @else if (!product()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <h2 class="text-xl font-bold text-slate-800">Producto no encontrado</h2>
          <p class="text-sm text-slate-500 mt-1 mb-6">
            El producto solicitado no existe o fue dado de baja del catálogo.
          </p>
          <a
            routerLink="/products"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"
          >
            Ir al Catálogo
          </a>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- Cabecera Principal -->
          <div class="p-6 sm:p-8 border-b border-slate-100">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700">
                Producto ID #{{ product()!.id }}
              </span>

              @if (product()!.availableStock > 5) {
                <span class="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                  En Stock ({{ product()!.availableStock }} disponibles)
                </span>
              } @else if (product()!.availableStock > 0) {
                <span class="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                  ¡Últimas {{ product()!.availableStock }} unidades disponibles!
                </span>
              } @else {
                <span class="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                  Agotado temporalmente
                </span>
              }
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <!-- Columna Izquierda: Información y Desglose de Stock -->
              <div class="lg:col-span-2 space-y-6">

                <!-- Banner visual del producto -->
                <div class="h-48 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex flex-col items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span class="text-xs font-mono tracking-wider uppercase text-slate-400">
                    Vista previa · Producto #{{ product()!.id }}
                  </span>
                </div>

                <div>
                  <h1 class="text-3xl font-extrabold text-slate-900">{{ product()!.name }}</h1>
                  <p class="text-base text-slate-600 mt-3 leading-relaxed">
                    {{ product()!.description || 'Este producto no cuenta con una descripción detallada cargada.' }}
                  </p>
                </div>

                <!-- Panel Visual de Estado de Inventario (MySQL) -->
                <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Estado del Inventario en Tiempo Real
                    </h3>
                    <button
                      type="button"
                      (click)="loadProduct()"
                      class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Sincronizar</span>
                    </button>
                  </div>

                  <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="p-3 bg-white rounded-lg border border-slate-200">
                      <span class="text-xs text-slate-400 block">Stock Físico</span>
                      <span class="text-xl font-bold text-slate-800">{{ product()!.stock }}</span>
                    </div>
                    <div class="p-3 bg-white rounded-lg border border-slate-200">
                      <span class="text-xs text-slate-400 block">En Carritos</span>
                      <span class="text-xl font-bold text-amber-600">{{ product()!.reservedStock }}</span>
                    </div>
                    <div class="p-3 bg-white rounded-lg border border-slate-200">
                      <span class="text-xs text-slate-400 block">Disponible Real</span>
                      <span class="text-xl font-bold text-emerald-600">{{ product()!.availableStock }}</span>
                    </div>
                  </div>

                  <!-- Barra de proporción disponible vs reservado -->
                  @if (product()!.stock > 0) {
                    <div class="space-y-1.5">
                      <div class="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                        <div
                          class="bg-emerald-500 transition-all duration-300"
                          [style.width.%]="availablePercentage()"
                          title="Disponible"
                        ></div>
                        <div
                          class="bg-amber-400 transition-all duration-300"
                          [style.width.%]="reservedPercentage()"
                          title="Reservado en carritos"
                        ></div>
                      </div>
                      <div class="flex justify-between text-[11px] text-slate-500">
                        <span>{{ availablePercentage() }}% disponible para reserva inmediata</span>
                        <span>{{ reservedPercentage() }}% retenido en carritos activos</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Columna Derecha: Caja de Compra / Reserva -->
              <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                <div>
                  <span class="text-xs uppercase tracking-wider text-slate-400 block">Precio Unitario</span>
                  <span class="text-3xl font-extrabold text-slate-900">
                    {{ product()!.price | currency:'ARS':'symbol-narrow':'1.2-2' }}
                  </span>
                </div>

                @if (product()!.availableStock > 0) {
                  <div class="space-y-2">
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Cantidad a reservar
                    </label>
                    <div class="flex items-center justify-between border border-slate-300 rounded-xl bg-white p-1">
                      <button
                        type="button"
                        (click)="changeQuantity(-1)"
                        [disabled]="quantity() <= 1"
                        class="w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span class="text-lg font-bold text-slate-900 select-none">
                        {{ quantity() }}
                      </span>
                      <button
                        type="button"
                        (click)="changeQuantity(1)"
                        [disabled]="quantity() >= product()!.availableStock"
                        class="w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex items-baseline justify-between text-sm">
                    <span class="text-slate-500">Subtotal estimado:</span>
                    <strong class="text-lg text-slate-900">
                      {{ product()!.price * quantity() | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </strong>
                  </div>
                }

                <button
                  type="button"
                  (click)="onAddToCart()"
                  [disabled]="product()!.availableStock === 0 || isAdding()"
                  class="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  @if (isAdding()) {
                    <span>Reservando stock...</span>
                  } @else if (product()!.availableStock === 0) {
                    <span>Sin Stock Disponible</span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Reservar en mi Carrito</span>
                  }
                </button>

                <p class="text-[11px] text-slate-500 text-center leading-normal">
                  La reserva bloquea temporalmente las unidades en MySQL para garantizar tu stock durante el checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  // Recibe automáticamente el parámetro :id desde la ruta gracias a withComponentInputBinding()
  readonly id = input.required<string>();

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly product = signal<Product | null>(null);
  readonly loading = signal<boolean>(true);
  readonly quantity = signal<number>(1);
  readonly isAdding = signal<boolean>(false);

  readonly availablePercentage = computed(() => {
    const p = this.product();
    if (!p || p.stock <= 0) return 0;
    return Math.round((p.availableStock / p.stock) * 100);
  });

  readonly reservedPercentage = computed(() => {
    const p = this.product();
    if (!p || p.stock <= 0) return 0;
    return Math.round((p.reservedStock / p.stock) * 100);
  });

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const numericId = Number(this.id());
    if (Number.isNaN(numericId)) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.productService.getProductById(numericId).subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.quantity.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
      },
    });
  }

  changeQuantity(delta: number): void {
    const max = this.product()?.availableStock ?? 1;
    this.quantity.update((curr) => Math.max(1, Math.min(max, curr + delta)));
  }

  onAddToCart(): void {
    const prod = this.product();
    if (!prod) return;

    if (!this.authService.isAuthenticated()) {
      this.notify.warning(
        'Iniciá sesión para comprar',
        'Necesitás ingresar con tu cuenta para reservar unidades.'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isAdding.set(true);
    const qty = this.quantity();

    this.cartService.addItem({ productId: prod.id, quantity: qty }).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.notify.success('Reserva confirmada', `Agregaste ${qty}x ${prod.name} al carrito.`);
        this.loadProduct();
      },
      error: (err) => {
        this.isAdding.set(false);
        const msg = err?.error?.message || 'No se pudo reservar el producto.';
        this.notify.error('Error al reservar', Array.isArray(msg) ? msg.join(', ') : msg);
        this.loadProduct();
      },
    });
  }
}