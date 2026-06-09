import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, TenantOption } from '../../core/services/auth.service';

type LoginStep = 'credentials' | 'tenant-select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  error:     string | null = null;
  isLoading  = false;

  // Flujo multi-tenant
  step: LoginStep   = 'credentials';
  tenants: TenantOption[] = [];
  tempToken         = '';
  selectedTenantId: number | null = null;
  isSelectingTenant = false;

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      correo:   ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // ── Paso 1: credenciales ──────────────────────────────────────────────────

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.error     = null;

    const { correo, password } = this.loginForm.value;

    this.authService.login(correo, password).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.requires_tenant_selection) {
          // Múltiples tenants → mostrar selector
          this.tenants   = res.tenants ?? [];
          this.tempToken = res.temp_token ?? '';
          this.step      = 'tenant-select';
          return;
        }

        // Login directo (1 tenant o super admin)
        this.authService.storeSession(res);
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.error = 'Correo electrónico o contraseña incorrectos.';
        } else {
          this.error = 'No se pudo conectar al servidor. Inténtalo más tarde.';
        }
      }
    });
  }

  // ── Paso 2: selección de tenant ───────────────────────────────────────────

  selectTenant(tenantId: number) {
    this.selectedTenantId  = tenantId;
    this.isSelectingTenant = true;
    this.error             = null;

    this.authService.selectTenant(this.tempToken, tenantId).subscribe({
      next: () => {
        this.isSelectingTenant = false;
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.isSelectingTenant = false;
        this.selectedTenantId  = null;
        this.error = err.error?.detail ?? 'Error al seleccionar el tenant. Intenta de nuevo.';
      }
    });
  }

  goBackToCredentials() {
    this.step          = 'credentials';
    this.tenants       = [];
    this.tempToken     = '';
    this.selectedTenantId = null;
    this.error         = null;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private navigateAfterLogin() {
    const role = this.authService.getRole();
    
    // Si es Administrador (Super Admin), enviarlo a su portal
    if (role === 'Administrador') {
      this.router.navigate(['/dashboard/saas/tenants']);
      return;
    }

    // Si es un rol del taller o mecanico web
    const allowed: (string | null)[] = ['Taller', 'Mecanico', 'Admin Tenant'];
    if (allowed.includes(role) || role === null || role === '') {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Acceso denegado. Los conductores deben ingresar mediante la aplicación móvil.';
      // We do not call this.authService.logout() here because it calls router.navigate(['/login']) 
      // which can refresh the component and wipe this error message.
      // We manually clean the storage so the user remains logged out but sees the message.
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('permisos');
      localStorage.removeItem('tenant_id');
      this.authService['currentUserRoleSubject'].next(null);
      this.authService['currentPermisosSubject'].next([]);
      this.authService['currentTenantSubject'].next(null);
    }
  }

  /** Devuelve las iniciales del nombre del tenant para el avatar */
  tenantInitials(nombre: string): string {
    return nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  /** Color de fondo del avatar por índice */
  tenantAvatarBg(index: number): string {
    const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706'];
    return colors[index % colors.length];
  }
}
