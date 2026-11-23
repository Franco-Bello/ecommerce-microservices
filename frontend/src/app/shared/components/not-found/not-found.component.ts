import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 text-emerald-400 font-black text-3xl tracking-tight shadow-md">
          404
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-bold text-slate-900">Página no encontrada</h1>
          <p class="text-sm text-slate-600 leading-relaxed">
            La ruta que estás buscando no existe, fue movida o no tenés acceso directo a ella.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            (click)="goBack()"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition cursor-pointer"
          >
            ← Volver atrás
          </button>
          <a
            routerLink="/products"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition shadow-xs"
          >
            Ir al Catálogo
          </a>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}