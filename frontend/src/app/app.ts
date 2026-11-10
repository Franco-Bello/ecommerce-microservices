import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    if (this.authService.token()) {
      this.authService.checkAuthStatus().subscribe({ error: () => {} });
    }
  }
}