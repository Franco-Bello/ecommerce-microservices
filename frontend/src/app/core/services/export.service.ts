import { Injectable } from '@angular/core';
import { Invoice } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportInvoicesToCsv(invoices: Invoice[], filename = 'facturacion-techstore.csv'): void {
    const headers = [
      'ID Comprobante',
      'Fecha Emision',
      'Cliente Nombre',
      'Cliente Email',
      'Cantidad Items',
      'Detalle Productos',
      'Total ARS',
    ];

    const rows = invoices.map((inv) => {
      const id = inv.id || inv._id || '';
      const date = new Date(inv.createdAt).toLocaleString('es-AR');
      const clientName = this.escapeCsv(inv.user?.name || `UID: ${inv.userId}`);
      const clientEmail = this.escapeCsv(inv.user?.email || 'N/A');
      const itemsCount = inv.items.reduce((acc, item) => acc + item.quantity, 0);
      const detail = this.escapeCsv(
        inv.items.map((i) => `${i.quantity}x ${i.name} ($${i.unitPrice})`).join(' | ')
      );
      const total = Number(inv.total).toFixed(2);

      return [id, this.escapeCsv(date), clientName, clientEmail, itemsCount, detail, total].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    const clean = String(value ?? '').replace(/"/g, '""');
    return `"${clean}"`;
  }
}