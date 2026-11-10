import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'ecommerce_token';
  private readonly USER_KEY = 'ecommerce_user';

  // Signals privados de escritura
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(this.loadTokenFromStorage());

  // Signals públicos de solo lectura y computados
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        this.setSession(response.user, response.accessToken);
        this.notify.success(`¡Bienvenido, ${response.user.name}!`);
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        this.setSession(response.user, response.accessToken);
        this.notify.success('Cuenta creada con éxito');
      })
    );
  }

  checkAuthStatus(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this._currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  updateCurrentUserSignal(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  logout(redirectToLogin = true): void {
    this.clearSession();
    this.notify.success('Sesión cerrada correctamente');
    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  clearSession(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private setSession(user: User, accessToken: string): void {
    this._currentUser.set(user);
    this._token.set(accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, accessToken);
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}