import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminProfile {
  Usuario: string | null;
}

export interface TallerProfile {
  Id: number;
  Nombre: string;
  Direccion: string;
  Coordenadas: string | null;
  Cap: number | null;
  Capmax: number | null;
}

export interface ConductorProfile {
}

export interface MecanicoProfile {
  id: number;
  estado: string;
}

export interface ProfileData {
  Id: number;
  Correo: string;
  Nombre: string | null;
  Apellidos: string | null;
  CI: string | null;
  Fechanac: string | null;
  rol_nombre: string | null;
  FotoPerfil: string | null;
  administrador: AdminProfile | null;
  taller: TallerProfile | null;
  conductor: ConductorProfile | null;
  mecanico: MecanicoProfile | null;
  tenant_nombre?: string | null;
  tenant_balance?: number | null;
}

export interface ProfileUpdatePayload {
  Correo?: string;
  Password?: string;
  Nombre?: string;
  Apellidos?: string;
  CI?: string;
  Fechanac?: string;
  admin_usuario?: string;
  taller_nombre?: string;
  taller_direccion?: string;
  taller_coordenadas?: string;
  taller_cap?: number;
  taller_capmax?: number;
  mecanico_estado?: string;
}

export interface UbicacionPayload {
  Coordenadas: string;
  Direccion?: string;
}

export interface PasswordChangePayload {
  contrasena_actual: string;
  nueva_contrasena: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private http = inject(HttpClient);

  getProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.apiUrl}/me`);
  }

  updateProfile(data: ProfileUpdatePayload): Observable<ProfileData> {
    return this.http.put<ProfileData>(`${this.apiUrl}/me`, data);
  }

  updateUbicacion(data: UbicacionPayload): Observable<ProfileData> {
    return this.http.put<ProfileData>(`${this.apiUrl}/me/ubicacion`, data);
  }

  /** Cambia la contraseña verificando la actual (PUT /profile/me/password) */
  changePassword(data: PasswordChangePayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/me/password`, data);
  }

  /** Sube una foto de perfil (POST /profile/me/avatar) */
  uploadAvatar(file: File): Observable<ProfileData> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProfileData>(`${this.apiUrl}/me/avatar`, formData);
  }

  /** Elimina la cuenta del usuario actual (DELETE /profile/me) */
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }
}
