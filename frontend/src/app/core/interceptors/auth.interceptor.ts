import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const token = authService.token();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (error.status === 401 && !isAuthEndpoint) {
        authService.clearSession();
        notify.warning('Sesión expirada', 'Por favor, iniciá sesión nuevamente.');
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};