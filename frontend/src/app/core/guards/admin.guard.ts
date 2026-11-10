import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  notify.error('Acceso denegado', 'Se requieren permisos de Administrador.');
  return router.createUrlTree(['/products']);
};