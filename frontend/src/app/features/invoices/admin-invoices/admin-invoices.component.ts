import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-slate-900">Facturación Global (ADMIN)</h1>
      <p class="text-slate-600 mt-1">Listado completo de facturas emitidas (Fase 5).</p>
    </div>
  `,
})
export class AdminInvoicesComponent {}