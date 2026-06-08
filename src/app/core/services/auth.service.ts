import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface TenantOption {
  id: number;
  nombre: string;
  logo: string | null;
  rol: string;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  role?: string;
  permisos?: string[];
  tenant_id?: number | null;
  requires_tenant_selection: boolean;
  temp_token?: string;
  tenants?: TenantOption[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserRoleSubject = new BehaviorSubject<string | null>(this.getStoredRole());
  currentUserRole$ = this.currentUserRoleSubject.asObservable();

  private currentPermisosSubject = new BehaviorSubject<string[]>(this.getStoredPermisos());
  currentPermisos$ = this.currentPermisosSubject.asObservable();

  private currentTenantSubject = new BehaviorSubject<number | null>(this.getStoredTenant());
  currentTenant$ = this.currentTenantSubject.asObservable();

  login(correo: string, password: string): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', correo);
    formData.append('password', password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, formData);
  }

  /** Segundo paso: confirma el tenant elegido y persiste el JWT final. */
  selectTenant(tempToken: string, tenantId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/select-tenant`, {
      temp_token: tempToken,
      tenant_id: tenantId
    }).pipe(
      tap(response => this.storeSession(response))
    );
  }

  /** Persiste el JWT y los datos de sesión en localStorage. */
  storeSession(response: any) {
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    // role puede ser null para super admin — lo guardamos igual
    const role = response.role ?? null;
    localStorage.setItem('role', role ?? '');
    this.currentUserRoleSubject.next(role);

    const permisos = response.permisos ?? [];
    localStorage.setItem('permisos', JSON.stringify(permisos));
    this.currentPermisosSubject.next(permisos);

    if (response.tenant_id !== undefined && response.tenant_id !== null) {
      localStorage.setItem('tenant_id', response.tenant_id.toString());
      this.currentTenantSubject.next(response.tenant_id);
    }
  }

  registerTaller(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar-taller`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('permisos');
    localStorage.removeItem('tenant_id');
    this.currentUserRoleSubject.next(null);
    this.currentPermisosSubject.next([]);
    this.currentTenantSubject.next(null);
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return this.currentUserRoleSubject.value || null;
  }

  getTenant(): number | null {
    return this.currentTenantSubject.value;
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('role') || null;
  }

  private getStoredTenant(): number | null {
    const tenantStr = localStorage.getItem('tenant_id');
    return tenantStr ? parseInt(tenantStr, 10) : null;
  }

  private getStoredPermisos(): string[] {
    const raw = localStorage.getItem('permisos');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  hasPermiso(permiso: string): boolean {
    if (this.getRole() === 'Administrador') return true;
    return this.currentPermisosSubject.value.includes(permiso);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
