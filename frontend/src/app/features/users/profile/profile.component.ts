import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateProfilePayload } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p class="text-sm text-slate-600 mt-1">
          Administrá tu información personal y credenciales de acceso
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <!-- Cabecera de Usuario -->
        <div class="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-400">Cuenta Activa</p>
            <h2 class="text-xl font-bold mt-0.5">{{ authService.currentUser()?.name }}</h2>
            <p class="text-sm text-slate-300">{{ authService.currentUser()?.email }}</p>
          </div>

          <span
            class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            [class.bg-amber-500/20]="authService.isAdmin()"
            [class.text-amber-300]="authService.isAdmin()"
            [class.bg-emerald-500/20]="!authService.isAdmin()"
            [class.text-emerald-300]="!authService.isAdmin()"
          >
            Rol: {{ authService.currentUser()?.role }}
          </span>
        </div>

        <!-- Formulario Reactivo -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            @if (profileForm.controls.name.touched && profileForm.controls.name.invalid) {
              <p class="text-xs text-red-600 mt-1">El nombre debe tener al menos 2 caracteres.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            @if (profileForm.controls.email.touched && profileForm.controls.email.invalid) {
              <p class="text-xs text-red-600 mt-1">Ingresá un correo electrónico válido.</p>
            }
          </div>

          <div class="pt-2 border-t border-slate-100">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Nueva Contraseña <span class="text-xs text-slate-400 font-normal">(Dejar en blanco para mantener la actual)</span>
            </label>
            <input
              type="password"
              formControlName="password"
              placeholder="Mínimo 6 caracteres si deseás cambiarla"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            @if (profileForm.controls.password.touched && profileForm.controls.password.invalid) {
              <p class="text-xs text-red-600 mt-1">La nueva contraseña debe tener al menos 6 caracteres.</p>
            }
          </div>

          <div class="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              [disabled]="profileForm.invalid || isSaving()"
              class="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold transition cursor-pointer"
            >
              {{ isSaving() ? 'Guardando cambios...' : 'Actualizar Perfil' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const current = this.authService.currentUser();
    if (current) {
      this.profileForm.patchValue({ name: current.name, email: current.email });
    }

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({ name: user.name, email: user.email });
      },
      error: () => {},
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const payload: UpdateProfilePayload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
    };

    if (raw.password.trim().length >= 6) {
      payload.password = raw.password.trim();
    }

    this.isSaving.set(true);
    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.profileForm.controls.password.reset('');
        this.notify.success('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || 'No se pudo actualizar el perfil.';
        this.notify.error('Error', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }
}