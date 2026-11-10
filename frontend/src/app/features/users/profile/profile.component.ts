import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="max-w-3xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-slate-900">Mi Perfil</h1>
      <p class="text-slate-600 mt-1">Edición de datos del usuario autenticado (Fase 5).</p>
    </div>
  `,
})
export class ProfileComponent {}