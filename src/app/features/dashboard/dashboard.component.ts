import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AnalyticsService, AnalyticsKPIs } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService    = inject(AuthService);
  private profileService = inject(ProfileService);
  private router         = inject(Router);
  private analyticsService = inject(AnalyticsService);

  readonly apiUrl = environment.apiUrl;

  role    = toSignal(this.authService.currentUserRole$, { initialValue: this.authService.getRole() });
  profile = toSignal(
    // Recarga el perfil cada vez que se navega de /dashboard/perfil a otra ruta
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      switchMap(() => this.profileService.getProfile())
    ),
    { initialValue: null }
  );

  kpis = signal<AnalyticsKPIs | null>(null);
  isLoadingKpis = signal<boolean>(false);

  ngOnInit() {
    if (this.hasPermiso('Ver Analytics')) {
      this.loadKpis();
    }
  }

  loadKpis() {
    this.isLoadingKpis.set(true);
    this.analyticsService.getKPIs().subscribe({
      next: (data) => {
        this.kpis.set(data);
        this.isLoadingKpis.set(false);
      },
      error: (err) => {
        console.error('Error loading KPIs', err);
        this.isLoadingKpis.set(false);
      }
    });
  }

  isHomePage() {
    return this.router.url === '/dashboard';
  }

  hasPermiso(permiso: string): boolean {
    return this.authService.hasPermiso(permiso);
  }

  logout() {
    this.authService.logout();
  }
}
