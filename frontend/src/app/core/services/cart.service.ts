import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddToCartPayload, Cart } from '../models';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  private readonly _cart = signal<Cart | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly items = computed(() => this._cart()?.items ?? []);
  readonly total = computed(() => this._cart()?.total ?? 0);
  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );
  readonly hasStockWarnings = computed(() =>
    this.items().some((item) => item.hasStockWarning)
  );

  loadCart(): Observable<Cart> {
    this._loading.set(true);
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap({
        next: (cart) => {
          this._cart.set(cart);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  addItem(payload: AddToCartPayload): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.apiUrl}/items`, payload)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.apiUrl}/items/${productId}`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  clearCart(): Observable<Cart> {
    return this.http
      .delete<Cart>(this.apiUrl)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  checkout(): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/checkout`, {}).pipe(
      tap(() => {
        this._cart.set({ userId: '', items: [], total: 0 });
      })
    );
  }

  resetLocalCart(): void {
    this._cart.set(null);
  }
}