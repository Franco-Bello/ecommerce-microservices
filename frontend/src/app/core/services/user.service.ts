import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { UpdateProfilePayload, User } from '@core/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => this.authService.updateCurrentUserSignal(user))
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, payload).pipe(
      tap((updatedUser) => this.authService.updateCurrentUserSignal(updatedUser))
    );
  }

  loadAllUsers(): Observable<User[]> {
    this._loading.set(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap({
        next: (users) => {
          this._users.set(users);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  deactivateUser(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._users.update((prev) => prev.filter((u) => u.id !== id));
      })
    );
  }
}