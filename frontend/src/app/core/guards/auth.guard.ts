import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  if (authService.isAuthenticated()) {
    return true;
  }

  notify.warning('Acceso restringido', 'Debés iniciar sesión para continuar.');
  return router.createUrlTree(['/auth/login']);
};