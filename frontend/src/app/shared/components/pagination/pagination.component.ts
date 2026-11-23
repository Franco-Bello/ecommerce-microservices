import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav aria-label="Paginación" class="mt-8 flex items-center justify-center gap-1.5">
        <!-- Botón Anterior -->
        <button
          type="button"
          (click)="goToPage(currentPage() - 1)"
          [disabled]="currentPage() <= 1"
          class="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          ← Anterior
        </button>

        <!-- Números de página y puntos suspensivos -->
        @for (item of visiblePages(); track $index) {
          @if (item === '...') {
            <span class="px-2.5 py-2 text-sm font-semibold text-slate-400 select-none">
              ...
            </span>
          } @else {
            <button
              type="button"
              (click)="goToPage(item)"
              [class]="
                item === currentPage()
                  ? 'px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold shadow-sm cursor-pointer'
                  : 'px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer'
              "
            >
              {{ item }}
            </button>
          }
        }

        <!-- Botón Siguiente -->
        <button
          type="button"
          (click)="goToPage(currentPage() + 1)"
          [disabled]="currentPage() >= totalPages()"
          class="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Siguiente →
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(6);
  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  readonly visiblePages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.pageChange.emit(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}