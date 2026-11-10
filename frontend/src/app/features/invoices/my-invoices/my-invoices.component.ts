import { Component } from '@angular/core';

@Component({
  selector: 'app-my-invoices',
  standalone: true,
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-slate-900">Mis Compras y Facturas</h1>
      <p class="text-slate-600 mt-1">Historial de facturación del usuario (Fase 5).</p>
    </div>
  `,
})
export class MyInvoicesComponent {}