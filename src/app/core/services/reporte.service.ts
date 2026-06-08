import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteStats {
  resumen: {
    total_incidentes: number;
    resueltos: number;
    pendientes: number;
    ingresos_totales: number;
    balance_plataforma: number;
  };
  por_estado: { [key: string]: number };
  historico_7_dias: { fecha: string; cantidad: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  getStatsTaller(): Observable<ReporteStats> {
    return this.http.get<ReporteStats>(`${this.apiUrl}/taller/stats`);
  }

  exportar(formato: string) {
    const url = `${this.apiUrl}/taller/export/${formato}`;
    const token = localStorage.getItem('token');
    
    // Usamos window.open para la descarga directa con el token en la URL o un link temporal
    // Pero dado que requiere Auth Bearer, es mejor usar HttpClient con blob
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `reporte_taller_${new Date().getTime()}.${formato}`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => console.error('Error al exportar:', err)
    });
  }
}
 
