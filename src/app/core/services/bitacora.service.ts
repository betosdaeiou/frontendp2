import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BitacoraEntry {
  id: number;
  accion: string;
  descripcion: string;
  fecha: string;
  ip: string;
  usuario_id?: number | null;
  usuario_correo?: string | null;
  usuario_rol?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private apiUrl = `${environment.apiUrl}/bitacora`;
  private http = inject(HttpClient);

  getEntries(): Observable<BitacoraEntry[]> {
    return this.http.get<BitacoraEntry[]>(this.apiUrl);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
