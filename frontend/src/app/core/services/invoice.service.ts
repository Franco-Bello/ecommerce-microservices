import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Invoice } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  private readonly _myInvoices = signal<Invoice[]>([]);
  private readonly _allInvoices = signal<Invoice[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly myInvoices = this._myInvoices.asReadonly();
  readonly allInvoices = this._allInvoices.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadMyInvoices(): Observable<Invoice[]> {
    this._loading.set(true);
    return this.http.get<Invoice[]>(`${this.apiUrl}/my-invoices`).pipe(
      tap({
        next: (invoices) => {
          this._myInvoices.set(invoices);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  loadAllInvoices(): Observable<Invoice[]> {
    this._loading.set(true);
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      tap({
        next: (invoices) => {
          this._allInvoices.set(invoices);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }
}