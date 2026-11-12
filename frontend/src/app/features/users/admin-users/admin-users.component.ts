import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { User } from '@core/models';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
            <span class="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-500/20 text-amber-800 border border-amber-500/30">
              ADMIN
            </span>
          </div>
          <p class="text-sm text-slate-600 mt-1">
            Usuarios activos en PostgreSQL (Prisma ORM) y control de baja lógica
          </p>
        </div>

        <div class="flex items-center gap-3">
          <input
            type="text"
            [value]="searchTerm()"
            (input)="onSearch($event)"
            placeholder="Buscar por nombre o email..."
            class="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="button"
            (click)="refresh()"
            class="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      @if (userService.loading()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Cargando listado de usuarios...
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
                  <th class="py-3.5 px-4">Nombre</th>
                  <th class="py-3.5 px-4">Email</th>
                  <th class="py-3.5 px-4 text-center">Rol</th>
                  <th class="py-3.5 px-4 text-center">Estado</th>
                  <th class="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3.5 px-4">
                      <div class="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{{ user.name }}</span>
                        @if (user.id === authService.currentUser()?.id) {
                          <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700">
                            Vos
                          </span>
                        }
                      </div>
                      <div class="text-xs font-mono text-slate-400">ID: {{ user.id }}</div>
                    </td>

                    <td class="py-3.5 px-4 text-slate-700">{{ user.email }}</td>

                    <td class="py-3.5 px-4 text-center">
                      @if (user.role === 'ADMIN') {
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          ADMIN
                        </span>
                      } @else {
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          USER
                        </span>
                      }
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Activo
                      </span>
                    </td>

                    <td class="py-3.5 px-4 text-right">
                      @if (user.id !== authService.currentUser()?.id) {
                        <button
                          type="button"
                          (click)="onDeactivate(user)"
                          class="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition cursor-pointer"
                        >
                          Dar de baja
                        </button>
                      } @else {
                        <span class="text-xs text-slate-400 italic">Sesión actual</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-12 text-center text-slate-500">
                      No se encontraron usuarios activos con ese filtro.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);

  readonly searchTerm = signal('');

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.userService.users();
    if (!term) return list;

    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.userService.loadAllUsers().subscribe({
      error: () => this.notify.error('Error', 'No se pudo cargar la lista de usuarios.'),
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  async onDeactivate(user: User): Promise<void> {
    const confirmed = await this.notify.confirm(
      `¿Dar de baja a ${user.name}?`,
      `El usuario (${user.email}) pasará a estado inactivo (isActive: false) y no podrá iniciar sesión.`,
      'Sí, dar de baja'
    );
    if (!confirmed) return;

    this.userService.deactivateUser(user.id).subscribe({
      next: () => {
        this.notify.success('Usuario desactivado', `${user.name} fue dado de baja correctamente.`);
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo dar de baja al usuario.';
        this.notify.error('Error', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }
}