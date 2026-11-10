import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { CreateProductPayload, Product, UpdateProductPayload } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadProducts(): Observable<Product[]> {
    this._loading.set(true);
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap({
        next: (products) => {
          this._products.set(products);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload).pipe(
      tap((newProduct) => {
        this._products.update((prev) => [newProduct, ...prev]);
      })
    );
  }

  updateProduct(id: number, payload: UpdateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updated) => {
        this._products.update((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._products.update((prev) => prev.filter((p) => p.id !== id));
      })
    );
  }
}