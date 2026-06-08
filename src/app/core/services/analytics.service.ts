import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalyticsKPIs {
  tiempo_promedio_asignacion_horas: number;
  tiempo_promedio_llegada_horas: number;
  incidentes_por_tipo: Record<string, number>;
  zonas_con_mas_incidentes: Record<string, number>;
  tasa_cancelados_porcentaje: number;
  cumplimiento_sla_porcentaje: number;
  total_incidentes: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes/kpis`;

  getKPIs(): Observable<AnalyticsKPIs> {
    return this.http.get<AnalyticsKPIs>(this.apiUrl);
  }
}
