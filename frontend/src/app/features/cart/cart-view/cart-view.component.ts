import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-slate-900">Mi Carrito</h1>
      <p class="text-slate-600 mt-1">Gestión de reservas y checkout (Fase 4).</p>
    </div>
  `,
})
export class CartViewComponent {}