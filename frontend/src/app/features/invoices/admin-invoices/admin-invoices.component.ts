import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '@core/models';
import { InvoiceService } from '@core/services/invoice.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado y Buscador -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-bold text-slate-900">Facturación Global</h1>
            <span class="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-500/20 text-amber-800 border border-amber-500/30">
              ADMIN
            </span>
          </div>
          <p class="text-sm text-slate-600 mt-1">
            Auditoría de comprobantes en MongoDB cruzados con usuarios de PostgreSQL
          </p>
        </div>

        <div class="flex items-center gap-3">
          <input
            type="text"
            [value]="searchTerm()"
            (input)="onSearch($event)"
            placeholder="Filtrar por cliente, email o ID..."
            class="w-full sm:w-72 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="button"
            (click)="refresh()"
            class="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      <!-- Tarjetas de Resumen (KPIs) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Facturas Emitidas
          </span>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">
            {{ filteredInvoices().length }}
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Unidades Vendidas
          </span>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">
            {{ totalUnitsSold() }}
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recaudación Total
          </span>
          <p class="text-3xl font-extrabold text-emerald-600 mt-1">
            {{ totalRevenue() | currency:'ARS':'symbol-narrow':'1.2-2' }}
          </p>
        </div>
      </div>

      <!-- Tabla de Facturas -->
      @if (invoiceService.loading()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Consultando facturas del sistema...
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
                  <th class="py-3.5 px-4">ObjectId</th>
                  <th class="py-3.5 px-4">Cliente (PostgreSQL)</th>
                  <th class="py-3.5 px-4">Fecha</th>
                  <th class="py-3.5 px-4 text-center">Ítems</th>
                  <th class="py-3.5 px-4 text-right">Total</th>
                  <th class="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (inv of filteredInvoices(); track getInvoiceId(inv)) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {{ getInvoiceId(inv) }}
                    </td>
                    <td class="py-3.5 px-4">
                      @if (inv.user) {
                        <div class="font-semibold text-slate-900">{{ inv.user.name }}</div>
                        <div class="text-xs text-slate-500">{{ inv.user.email }}</div>
                      } @else {
                        <span class="text-xs font-mono text-slate-400">UID: {{ inv.userId }}</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">
                      {{ inv.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {{ inv.items.length }} prod.
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                      {{ inv.total | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        (click)="selectedInvoice.set(inv)"
                        class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
                      >
                        Desglose
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-slate-500">
                      No se encontraron facturas registradas con ese criterio.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Modal de Desglose -->
    @if (selectedInvoice()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold">Auditoría de Factura</h3>
              <p class="text-xs text-slate-400 font-mono">#{{ getInvoiceId(selectedInvoice()!) }}</p>
            </div>
            <button
              type="button"
              (click)="selectedInvoice.set(null)"
              class="text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm flex justify-between">
              <div>
                <span class="text-xs text-slate-400 block">Comprador</span>
                <strong class="text-slate-900">{{ selectedInvoice()!.user?.name || 'N/A' }}</strong>
                <span class="block text-xs text-slate-500">{{ selectedInvoice()!.user?.email }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-400 block">Fecha</span>
                <strong class="text-slate-800">
                  {{ selectedInvoice()!.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
                </strong>
              </div>
            </div>

            <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl px-4">
              @for (item of selectedInvoice()!.items; track item.productId) {
                <div class="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span class="font-semibold text-slate-800">{{ item.name }}</span>
                    <span class="text-xs text-slate-500 block">
                      {{ item.quantity }} x {{ item.unitPrice | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </span>
                  </div>
                  <span class="font-bold text-slate-900">
                    {{ item.subtotal | currency:'ARS':'symbol-narrow':'1.2-2' }}
                  </span>
                </div>
              }
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-base font-bold text-slate-800">Total Facturado</span>
              <span class="text-2xl font-extrabold text-emerald-600">
                {{ selectedInvoice()!.total | currency:'ARS':'symbol-narrow':'1.2-2' }}
              </span>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                (click)="selectedInvoice.set(null)"
                class="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold cursor-pointer"
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
export class AdminInvoicesComponent implements OnInit {
  readonly invoiceService = inject(InvoiceService);
  private readonly notify = inject(NotificationService);

  readonly searchTerm = signal('');
  readonly selectedInvoice = signal<Invoice | null>(null);

  readonly filteredInvoices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.invoiceService.allInvoices();
    if (!term) return list;

    return list.filter((inv) => {
      const id = this.getInvoiceId(inv).toLowerCase();
      const name = inv.user?.name?.toLowerCase() ?? '';
      const email = inv.user?.email?.toLowerCase() ?? '';
      return id.includes(term) || name.includes(term) || email.includes(term);
    });
  });

  readonly totalRevenue = computed(() =>
    this.filteredInvoices().reduce((acc, inv) => acc + Number(inv.total), 0)
  );

  readonly totalUnitsSold = computed(() =>
    this.filteredInvoices().reduce(
      (acc, inv) => acc + inv.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    )
  );

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.invoiceService.loadAllInvoices().subscribe({
      error: () => this.notify.error('Error', 'No se pudo cargar la facturación global.'),
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  getInvoiceId(invoice: Invoice): string {
    return invoice.id || invoice._id || '';
  }
}