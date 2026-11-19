import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '@core/models';
import { InvoiceService } from '@core/services/invoice.service';
import { ExportService } from '@core/services/export.service';
import { NotificationService } from '@core/services/notification.service';

export interface TopProductMetric {
  productId: number;
  name: string;
  unitsSold: number;
  revenue: number;
}

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado y Acciones -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
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

        <div class="flex flex-wrap items-center gap-3">
          <input
            type="text"
            [value]="searchTerm()"
            (input)="onSearch($event)"
            placeholder="Filtrar por cliente, email o ID..."
            class="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="button"
            (click)="onExportCsv()"
            [disabled]="filteredInvoices().length === 0"
            class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar CSV</span>
          </button>
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            Ticket Promedio
          </span>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">
            {{ averageTicket() | currency:'ARS':'symbol-narrow':'1.2-2' }}
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

      <!-- Ranking Top 3 Productos Más Vendidos -->
      @if (topProducts().length > 0) {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700">
              Top 3 Productos Más Vendidos
            </h2>
            <span class="text-xs text-slate-400">Calculado sobre las facturas filtradas</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (prod of topProducts(); track prod.productId; let idx = $index) {
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="w-8 h-8 rounded-full font-extrabold text-sm flex items-center justify-center shrink-0"
                    [class.bg-amber-400]="idx === 0"
                    [class.text-slate-950]="idx === 0"
                    [class.bg-slate-200]="idx === 1"
                    [class.text-slate-800]="idx === 1"
                    [class.bg-amber-700/20]="idx === 2"
                    [class.text-amber-900]="idx === 2"
                  >
                    #{{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 text-sm truncate" [title]="prod.name">
                      {{ prod.name }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ prod.unitsSold }} unidades vendidas
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-xs text-slate-400 block">Ingresos</span>
                  <span class="font-bold text-emerald-600 text-sm">
                    {{ prod.revenue | currency:'ARS':'symbol-narrow':'1.2-2' }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

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

    <!-- Modal de Desglose Imprimible -->
    @if (selectedInvoice()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div
          id="printable-invoice"
          class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
        >
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span class="text-[11px] uppercase tracking-widest text-amber-400 font-bold block">
                TechStore · Auditoría de Comprobante
              </span>
              <h3 class="text-lg font-bold">Factura Electrónica</h3>
              <p class="text-xs text-slate-400 font-mono">#{{ getInvoiceId(selectedInvoice()!) }}</p>
            </div>
            <button
              type="button"
              (click)="selectedInvoice.set(null)"
              class="text-slate-400 hover:text-white transition cursor-pointer print:hidden"
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

            <div class="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                type="button"
                (click)="printInvoice()"
                class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimir / Guardar PDF</span>
              </button>
              <button
                type="button"
                (click)="selectedInvoice.set(null)"
                class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold cursor-pointer"
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
  private readonly exportService = inject(ExportService);
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

  readonly averageTicket = computed(() => {
    const count = this.filteredInvoices().length;
    return count > 0 ? this.totalRevenue() / count : 0;
  });

  readonly topProducts = computed<TopProductMetric[]>(() => {
    const map = new Map<number, TopProductMetric>();

    for (const inv of this.filteredInvoices()) {
      for (const item of inv.items) {
        const existing = map.get(item.productId);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += Number(item.subtotal);
        } else {
          map.set(item.productId, {
            productId: item.productId,
            name: item.name,
            unitsSold: item.quantity,
            revenue: Number(item.subtotal),
          });
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 3);
  });

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

  onExportCsv(): void {
    const list = this.filteredInvoices();
    if (list.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    this.exportService.exportInvoicesToCsv(list, `facturacion-techstore-${today}.csv`);
    this.notify.success('Exportación completa', `Se descargaron ${list.length} facturas en formato CSV.`);
  }

  printInvoice(): void {
    window.print();
  }

  getInvoiceId(invoice: Invoice): string {
    return invoice.id || invoice._id || '';
  }
}