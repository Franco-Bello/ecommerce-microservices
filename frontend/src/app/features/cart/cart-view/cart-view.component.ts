import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '@core/models';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Mi Carrito de Compras</h1>
          <p class="text-sm text-slate-600 mt-1">
            Tus productos están reservados temporalmente mientras completás la compra
          </p>
        </div>

        @if (cartService.items().length > 0) {
          <button
            type="button"
            (click)="onClearCart()"
            [disabled]="isProcessing()"
            class="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            Vaciar Carrito
          </button>
        }
      </div>

      <!-- Banner global de advertencia de stock (hasStockWarning) -->
      @if (cartService.hasStockWarnings()) {
        <div class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-amber-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="text-sm">
            <p class="font-bold">Atención: Hay advertencias de disponibilidad en tu carrito</p>
            <p class="mt-0.5 text-amber-800">
              Alguno de los productos reservados sufrió cambios de stock físico. Revisá los ítems marcados antes de confirmar la compra.
            </p>
          </div>
        </div>
      }

      @if (cartService.loading()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Cargando tus reservas activas...
        </div>
      } @else if (cartService.items().length === 0) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Tu carrito está vacío</h2>
          <p class="text-sm text-slate-500 mt-1 mb-6">
            Explorá el catálogo para reservar productos y generar tu compra.
          </p>
          <a
            routerLink="/products"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
          >
            Ir al Catálogo
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Lista de Ítems -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cartService.items(); track item.productId) {
              <div
                class="bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                [class.border-amber-400]="item.hasStockWarning"
                [class.bg-amber-50/30]="item.hasStockWarning"
                [class.border-slate-200]="!item.hasStockWarning"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-slate-400">Reserva #{{ item.reservationId }}</span>
                    @if (item.hasStockWarning) {
                      <span class="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Stock comprometido (Disp: {{ item.availableStock }})
                      </span>
                    }
                  </div>

                  <h3 class="text-lg font-bold text-slate-900">{{ item.name }}</h3>
                  <p class="text-sm text-slate-500">
                    Precio unitario:
                    <strong class="text-slate-700">
                      {{ item.unitPrice | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </strong>
                    · Cantidad reservada:
                    <strong class="text-emerald-700">{{ item.quantity }} u.</strong>
                  </p>
                </div>

                <div class="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div class="text-right">
                    <span class="text-xs text-slate-400 block">Subtotal</span>
                    <span class="text-xl font-extrabold text-slate-900">
                      {{ item.subtotal | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </span>
                  </div>

                  <button
                    type="button"
                    (click)="onRemoveItem(item)"
                    [disabled]="isProcessing()"
                    class="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Quitar reserva</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Resumen de Compra y Checkout -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-5">
              <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Resumen de Compra
              </h2>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-slate-600">
                  <span>Unidades reservadas</span>
                  <span class="font-semibold text-slate-900">{{ cartService.totalItems() }}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Ítems distintos</span>
                  <span class="font-semibold text-slate-900">{{ cartService.items().length }}</span>
                </div>
              </div>

              <div class="border-t border-slate-200 pt-4 flex items-baseline justify-between">
                <span class="text-base font-bold text-slate-900">Total a Pagar</span>
                <span class="text-2xl font-extrabold text-emerald-600">
                  {{ cartService.total() | currency:'ARS':'symbol-narrow':'1.2-2' }}
                </span>
              </div>

              <button
                type="button"
                (click)="onCheckout()"
                [disabled]="isProcessing() || cartService.hasStockWarnings()"
                class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                @if (isProcessing()) {
                  <span>Procesando compra...</span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Compra</span>
                }
              </button>

              @if (cartService.hasStockWarnings()) {
                <p class="text-xs text-center text-amber-700 font-medium">
                  Quitá o ajustá los productos con advertencia de stock para habilitar el checkout.
                </p>
              }

              <a
                routerLink="/products"
                class="block text-center text-sm font-medium text-slate-600 hover:text-slate-900 pt-2"
              >
                ← Seguir comprando
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartViewComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly isProcessing = signal(false);

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      error: () => this.notify.error('Error', 'No se pudo obtener el estado actual del carrito.'),
    });
  }

  onRemoveItem(item: CartItem): void {
    this.isProcessing.set(true);
    this.cartService.removeItem(item.productId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.notify.success('Reserva liberada', `Se quitó ${item.name} del carrito.`);
      },
      error: (err) => {
        this.isProcessing.set(false);
        const msg = err?.error?.message || 'No se pudo eliminar el ítem.';
        this.notify.error('Error', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }

  async onClearCart(): Promise<void> {
    const confirmed = await this.notify.confirm(
      '¿Vaciar todo el carrito?',
      'Se liberarán todas las reservas de stock que tenés activas.',
      'Sí, vaciar'
    );
    if (!confirmed) return;

    this.isProcessing.set(true);
    this.cartService.clearCart().subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.notify.success('Carrito vacío', 'Se liberaron todas tus reservas.');
      },
      error: () => {
        this.isProcessing.set(false);
        this.notify.error('Error', 'No se pudo vaciar el carrito.');
      },
    });
  }

  async onCheckout(): Promise<void> {
    const confirmed = await this.notify.confirm(
      '¿Confirmar compra?',
      `Se descontará el stock físico y se emitirá tu factura por $${this.cartService.total().toFixed(2)}.`,
      'Sí, comprar ahora'
    );
    if (!confirmed) return;

    this.isProcessing.set(true);
    this.cartService.checkout().subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.notify.success(
          '¡Compra realizada con éxito!',
          'Tu factura fue generada correctamente.'
        );
        this.router.navigate(['/invoices/my-invoices']);
      },
      error: (err) => {
        this.isProcessing.set(false);
        const msg = err?.error?.message || 'No se pudo procesar el checkout.';
        this.notify.error('Error en Checkout', Array.isArray(msg) ? msg.join(', ') : msg);
        this.cartService.loadCart().subscribe({ error: () => {} });
      },
    });
  }
}