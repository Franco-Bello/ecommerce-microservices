import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'techstore_theme';

  private readonly _isDark = signal<boolean>(this.loadInitialTheme());
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    effect(() => {
      const dark = this._isDark();
      const root = document.documentElement;

      if (dark) {
        root.classList.add('dark');
        localStorage.setItem(this.STORAGE_KEY, 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem(this.STORAGE_KEY, 'light');
      }
    });
  }

  toggleTheme(): void {
    this._isDark.update((current) => !current);
  }

  private loadInitialTheme(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}