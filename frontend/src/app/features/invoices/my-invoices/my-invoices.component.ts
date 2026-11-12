import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Invoice } from '@core/models';
import { InvoiceService } from '@core/services/invoice.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-my-invoices',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Mis Compras y Facturas</h1>
          <p class="text-sm text-slate-600 mt-1">
            Comprobantes electrónicos emitidos en MongoDB asociados a tu cuenta
          </p>
        </div>

        <button
          type="button"
          (click)="refresh()"
          class="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      @if (invoiceService.loading()) {
        <div class="space-y-4">
          @for (item of [1, 2, 3]; track item) {
            <div class="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-36"></div>
          }
        </div>
      } @else if (invoiceService.myInvoices().length === 0) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Todavía no registrás compras</h2>
          <p class="text-sm text-slate-500 mt-1 mb-6">
            Cuando confirmes un carrito de compras, tus facturas aparecerán aquí automáticamente.
          </p>
          <a
            routerLink="/products"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
          >
            Explorar Catálogo
          </a>
        </div>
      } @else {
        <div class="space-y-5">
          @for (invoice of invoiceService.myInvoices(); track getInvoiceId(invoice)) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:border-slate-300 transition">
              <!-- Cabecera de Factura -->
              <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span class="text-xs text-slate-400 block uppercase tracking-wider">Comprobante ID</span>
                    <span class="font-mono font-semibold text-slate-800">{{ getInvoiceId(invoice) }}</span>
                  </div>
                  <div class="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                  <div>
                    <span class="text-xs text-slate-400 block uppercase tracking-wider">Fecha de Emisión</span>
                    <span class="font-medium text-slate-700">
                      {{ invoice.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <span class="text-xs text-slate-400 block uppercase tracking-wider">Total Facturado</span>
                    <span class="text-lg font-extrabold text-emerald-600">
                      {{ invoice.total | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </span>
                  </div>

                  <button
                    type="button"
                    (click)="openDetail(invoice)"
                    class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>

              <!-- Resumen de Ítems -->
              <div class="p-6">
                <div class="divide-y divide-slate-100">
                  @for (item of invoice.items; track item.productId) {
                    <div class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                      <div class="flex items-center gap-3">
                        <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs">
                          {{ item.quantity }}x
                        </span>
                        <span class="font-medium text-slate-800">{{ item.name }}</span>
                        <span class="text-xs text-slate-400">
                          ({{ item.unitPrice | currency:'ARS':'symbol-narrow':'1.2-2' }} c/u)
                        </span>
                      </div>
                      <span class="font-semibold text-slate-900">
                        {{ item.subtotal | currency:'ARS':'symbol-narrow':'1.2-2' }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Detalle de Factura (GET /api/invoices/:id) -->
    @if (selectedInvoice()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold">Comprobante Electrónico</h3>
              <p class="text-xs text-slate-400 font-mono">ObjectId: {{ getInvoiceId(selectedInvoice()!) }}</p>
            </div>
            <button
              type="button"
              (click)="selectedInvoice.set(null)"
              class="text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              <div>
                <span class="text-xs text-slate-400 block">Cliente</span>
                <span class="font-semibold text-slate-800">
                  {{ selectedInvoice()!.user?.name || 'Usuario Autenticado' }}
                </span>
                @if (selectedInvoice()!.user?.email) {
                  <span class="text-xs text-slate-500 block">{{ selectedInvoice()!.user?.email }}</span>
                }
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-400 block">Fecha y Hora</span>
                <span class="font-semibold text-slate-800">
                  {{ selectedInvoice()!.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
                </span>
              </div>
            </div>

            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <table class="w-full text-left border-collapse text-sm">
                <thead>
                  <tr class="bg-slate-100 text-slate-600 text-xs uppercase">
                    <th class="py-2.5 px-4">Producto</th>
                    <th class="py-2.5 px-3 text-center">Cant.</th>
                    <th class="py-2.5 px-3 text-right">Unitario</th>
                    <th class="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  @for (item of selectedInvoice()!.items; track item.productId) {
                    <tr>
                      <td class="py-2.5 px-4 font-medium text-slate-800">{{ item.name }}</td>
                      <td class="py-2.5 px-3 text-center text-slate-600">{{ item.quantity }}</td>
                      <td class="py-2.5 px-3 text-right text-slate-600">
                        {{ item.unitPrice | currency:'ARS':'symbol-narrow':'1.2-2' }}
                      </td>
                      <td class="py-2.5 px-4 text-right font-semibold text-slate-900">
                        {{ item.subtotal | currency:'ARS':'symbol-narrow':'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200">
              <span class="text-base font-bold text-slate-800">Total Abonado</span>
              <span class="text-2xl font-extrabold text-emerald-600">
                {{ selectedInvoice()!.total | currency:'ARS':'symbol-narrow':'1.2-2' }}
              </span>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                (click)="selectedInvoice.set(null)"
                class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class MyInvoicesComponent implements OnInit {
  readonly invoiceService = inject(InvoiceService);
  private readonly notify = inject(NotificationService);

  readonly selectedInvoice = signal<Invoice | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.invoiceService.loadMyInvoices().subscribe({
      error: () => this.notify.error('Error', 'No se pudieron cargar tus facturas.'),
    });
  }

  getInvoiceId(invoice: Invoice): string {
    return invoice.id || invoice._id || '';
  }

  openDetail(invoice: Invoice): void {
    const id = this.getInvoiceId(invoice);
    if (!id) {
      this.selectedInvoice.set(invoice);
      return;
    }

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (detailed) => this.selectedInvoice.set(detailed),
      error: () => this.selectedInvoice.set(invoice),
    });
  }
}