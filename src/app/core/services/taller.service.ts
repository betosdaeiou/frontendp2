import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Taller {
  Id: number;
  Nombre: string;
  Direccion: string;
  Coordenadas?: string;
  Cap?: number;
  Capmax?: number;
  IdUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class TallerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/talleres`;

  getMisSucursales(): Observable<Taller[]> {
    return this.http.get<Taller[]>(`${this.apiUrl}/mis-sucursales`);
  }

  crearSucursal(data: any): Observable<Taller> {
    return this.http.post<Taller>(this.apiUrl, data);
  }
}
