import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado y Acciones -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p class="text-slate-600 text-sm mt-1">
            Stock sincronizado en tiempo real con reservas activas
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Buscador rápido -->
          <div class="relative">
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearch($event)"
              placeholder="Buscar producto..."
              class="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Botón Refrescar -->
          <button
            type="button"
            (click)="refreshCatalog()"
            class="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Actualizar stock"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>

          <!-- Botón Crear Producto (Solo ADMIN) -->
          @if (authService.isAdmin()) {
            <button
              type="button"
              (click)="openCreateModal()"
              class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Nuevo Producto</span>
            </button>
          }
        </div>
      </div>

      <!-- Estado de Carga -->
      @if (productService.loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of [1, 2, 3, 4, 5, 6]; track item) {
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse h-64 flex flex-col justify-between">
              <div>
                <div class="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div class="h-3 bg-slate-200 rounded w-full mb-2"></div>
                <div class="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div class="h-10 bg-slate-200 rounded-lg w-full"></div>
            </div>
          }
        </div>
      } @else {
        <!-- Grilla de Productos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of filteredProducts(); track product.id) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
              <div class="p-6">
                <!-- Cabecera de tarjeta: ID + Badge de Disponibilidad -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="text-xs font-mono text-slate-400">#{{ product.id }}</span>
                  @if (product.availableStock > 5) {
                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      Disponible: {{ product.availableStock }} u.
                    </span>
                  } @else if (product.availableStock > 0) {
                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                      ¡Últimas {{ product.availableStock }} unidades!
                    </span>
                  } @else {
                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Agotado
                    </span>
                  }
                </div>

                <!-- Nombre y Descripción -->
                <h2 class="text-lg font-bold text-slate-900 line-clamp-1" [title]="product.name">
                  {{ product.name }}
                </h2>
                <p class="text-sm text-slate-600 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {{ product.description || 'Sin descripción adicional.' }}
                </p>

                <!-- Precio y Detalle de Stock -->
                <div class="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span class="text-xs text-slate-400 block">Precio unitario</span>
                    <span class="text-2xl font-extrabold text-slate-900">
                      {{ product.price | currency:'ARS':'symbol-narrow':'1.2-2' }}
                    </span>
                  </div>

                  <div class="text-right text-xs text-slate-500">
                    <div>Stock físico: <strong class="text-slate-700">{{ product.stock }}</strong></div>
                    @if (product.reservedStock > 0) {
                      <div class="text-amber-600">En carritos: {{ product.reservedStock }}</div>
                    }
                  </div>
                </div>
              </div>

              <!-- Pie de tarjeta: Agregar al carrito + Controles ADMIN -->
              <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
                <div class="flex items-center gap-2">
                  <!-- Selector de cantidad -->
                  <div class="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      (click)="changeQuantity(product.id, -1, product.availableStock)"
                      [disabled]="product.availableStock === 0 || getQuantity(product.id) <= 1"
                      class="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span class="px-3 text-sm font-semibold text-slate-800 select-none">
                      {{ product.availableStock === 0 ? 0 : getQuantity(product.id) }}
                    </span>
                    <button
                      type="button"
                      (click)="changeQuantity(product.id, 1, product.availableStock)"
                      [disabled]="product.availableStock === 0 || getQuantity(product.id) >= product.availableStock"
                      class="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <!-- Botón Agregar al Carrito -->
                  <button
                    type="button"
                    (click)="onAddToCart(product)"
                    [disabled]="product.availableStock === 0 || addingProductId() === product.id"
                    class="flex-1 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    @if (addingProductId() === product.id) {
                      <span>Reservando...</span>
                    } @else if (product.availableStock === 0) {
                      <span>Sin Stock</span>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Agregar</span>
                    }
                  </button>
                </div>

                <!-- Acciones exclusivas ADMIN -->
                @if (authService.isAdmin()) {
                  <div class="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="openEditModal(product)"
                      class="px-3 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="onDeleteProduct(product)"
                      class="px-3 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/30 transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p class="text-lg font-semibold text-slate-700">No se encontraron productos</p>
              <p class="text-sm text-slate-500 mt-1">
                Probá con otro término de búsqueda o agregá productos desde una cuenta Administrador.
              </p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Crear / Editar Producto (Solo ADMIN) -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 class="text-lg font-bold">
              {{ editingProduct() ? 'Editar Producto #' + editingProduct()!.id : 'Nuevo Producto' }}
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onSaveProduct()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Ej: Monitor Gamer 27'' 144Hz"
                class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              @if (productForm.controls.name.touched && productForm.controls.name.invalid) {
                <p class="text-xs text-red-600 mt-1">El nombre es obligatorio (mínimo 2 caracteres).</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
              <textarea
                rows="3"
                formControlName="description"
                placeholder="Características principales del producto..."
                class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Precio Unitario ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  formControlName="price"
                  class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                @if (productForm.controls.price.touched && productForm.controls.price.invalid) {
                  <p class="text-xs text-red-600 mt-1">Ingresá un precio mayor a 0.</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Stock Físico Total</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  formControlName="stock"
                  class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                @if (productForm.controls.stock.touched && productForm.controls.stock.invalid) {
                  <p class="text-xs text-red-600 mt-1">El stock no puede ser negativo.</p>
                }
              </div>
            </div>

            <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="productForm.invalid || isSavingProduct()"
                class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                {{ isSavingProduct() ? 'Guardando...' : 'Guardar Producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ProductListComponent implements OnInit {
  readonly productService = inject(ProductService);
  readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly searchTerm = signal('');
  readonly quantities = signal<Record<number, number>>({});
  readonly addingProductId = signal<number | null>(null);

  // Estado Modal ADMIN
  readonly isModalOpen = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly isSavingProduct = signal(false);

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.productService.products().filter((p) => p.isActive !== false);
    if (!term) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.refreshCatalog();
  }

  refreshCatalog(): void {
    this.productService.loadProducts().subscribe({
      error: () => this.notify.error('Error', 'No se pudo cargar el catálogo de productos.'),
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  getQuantity(productId: number): number {
    return this.quantities()[productId] ?? 1;
  }

  changeQuantity(productId: number, delta: number, maxAvailable: number): void {
    const current = this.getQuantity(productId);
    const next = Math.max(1, Math.min(maxAvailable, current + delta));
    this.quantities.update((prev) => ({ ...prev, [productId]: next }));
  }

  onAddToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.notify.warning(
        'Iniciá sesión para comprar',
        'Necesitás ingresar con tu cuenta para reservar productos en el carrito.'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    const quantity = this.getQuantity(product.id);
    if (quantity > product.availableStock) {
      this.notify.warning('Stock insuficiente', 'No hay suficientes unidades disponibles.');
      return;
    }

    this.addingProductId.set(product.id);
    this.cartService.addItem({ productId: product.id, quantity }).subscribe({
      next: () => {
        this.addingProductId.set(null);
        this.quantities.update((prev) => ({ ...prev, [product.id]: 1 }));
        this.notify.success('Reserva agregada', `${quantity}x ${product.name} en tu carrito.`);
        this.refreshCatalog();
      },
      error: (err) => {
        this.addingProductId.set(null);
        const msg = err?.error?.message || 'No se pudo reservar el producto.';
        this.notify.error('Error al reservar', Array.isArray(msg) ? msg.join(', ') : msg);
        this.refreshCatalog();
      },
    });
  }

  // Métodos ABM ADMIN
  openCreateModal(): void {
    this.editingProduct.set(null);
    this.productForm.reset({ name: '', description: '', price: 1000, stock: 10 });
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.reset({
      name: product.name,
      description: product.description ?? '',
      price: Number(product.price),
      stock: Number(product.stock),
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
  }

  onSaveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSavingProduct.set(true);
    const raw = this.productForm.getRawValue();
    const payload = {
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      price: Number(raw.price),
      stock: Number(raw.stock),
    };

    const editing = this.editingProduct();
    const request$ = editing
      ? this.productService.updateProduct(editing.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.isSavingProduct.set(false);
        this.closeModal();
        this.notify.success(
          editing ? 'Producto actualizado' : 'Producto creado',
          `El catálogo fue actualizado correctamente.`
        );
        this.refreshCatalog();
      },
      error: (err) => {
        this.isSavingProduct.set(false);
        const msg = err?.error?.message || 'No se pudo guardar el producto.';
        this.notify.error('Error', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }

  async onDeleteProduct(product: Product): Promise<void> {
    const confirmed = await this.notify.confirm(
      `¿Eliminar "${product.name}"?`,
      'Se realizará la baja lógica del producto y se liberarán sus reservas activas.',
      'Sí, eliminar'
    );

    if (!confirmed) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notify.success('Producto eliminado', `${product.name} fue dado de baja.`);
        if (this.authService.isAuthenticated()) {
          this.cartService.loadCart().subscribe({ error: () => {} });
        }
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo eliminar el producto.';
        this.notify.error('Error al eliminar', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }
}