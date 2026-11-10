import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
      <p class="text-slate-600 mt-1">Lista de productos lista para desarrollar en la Fase 4.</p>
    </div>
  `,
})
export class ProductListComponent {}