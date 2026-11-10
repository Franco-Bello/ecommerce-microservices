import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-slate-900">Crear Cuenta</h1>
          <p class="text-sm text-slate-500 mt-1">Completá tus datos para registrarte en la tienda</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Franco Bello"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            @if (registerForm.controls.name.touched && registerForm.controls.name.invalid) {
              <p class="text-xs text-red-600 mt-1">El nombre es obligatorio (mínimo 2 caracteres).</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="usuario@correo.com"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            @if (registerForm.controls.email.touched && registerForm.controls.email.invalid) {
              <p class="text-xs text-red-600 mt-1">Ingresá un correo electrónico válido.</p>
            }
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            @if (registerForm.controls.password.touched && registerForm.controls.password.invalid) {
              <p class="text-xs text-red-600 mt-1">La contraseña debe tener al menos 6 caracteres.</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || isSubmitting()"
            class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            @if (isSubmitting()) {
              <span>Creando cuenta...</span>
            } @else {
              <span>Registrarme</span>
            }
          </button>
        </form>

        <p class="text-center text-sm text-slate-600 mt-6">
          ¿Ya tenés una cuenta?
          <a routerLink="/auth/login" class="font-semibold text-slate-900 hover:underline">
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe({ error: () => {} });
        this.isSubmitting.set(false);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'No se pudo completar el registro.';
        this.notify.error('Error al registrarse', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }
}