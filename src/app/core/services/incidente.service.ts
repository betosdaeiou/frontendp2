import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Evidencia {
  id: number;
  audio?: string;
  descripcion?: string;
  fotos?: string;
  incidente_id: number;
}

export interface TallerEnIncidente {
  Id: number;
  Nombre: string;
  Direccion: string;
  Coordenadas?: string;
  servicios?: ServicioTallerOut[];
}

export interface ServicioTallerOut {
  id: number;
  nombre: string;
}

export interface AnalisisIAEnIncidente {
  Clasificacion?: string;
  NivelPrioridad?: string;
  Resumen?: string;
  informacion_valida?: boolean;
}

export interface Cotizacion {
  id: number;
  monto?: number;
  mensaje?: string;
  tiempo_estimado?: string;
  estado: string;
  fecha_creacion?: string;
  incidente_id: number;
  taller_id: number;
  taller?: TallerEnIncidente;
}

export interface VehiculoConductorEnIncidente {
  id: number;
  conductor?: {
    Nombre: string;
    Apellidos: string;
    CI: number;
  };
}

export interface PagoEnIncidente {
  id: number;
  monto_total: number;
  metodo: string;
  estado: string;
  fecha?: string;
  incidente_id: number;
}

export interface IncidenteDetalle {
  id: number;
  coordenadagps?: string;
  estado?: string;
  fecha?: string;
  vehiculoconductor_id: number;
  vehiculoconductor?: VehiculoConductorEnIncidente;
  taller_id?: number;
  evidencias: Evidencia[];
  taller?: TallerEnIncidente;
  analisis_ia?: AnalisisIAEnIncidente;
  distancia_km?: number;
  cotizaciones?: Cotizacion[];
  mecanicos?: any[];
  pagos?: PagoEnIncidente[];
}

@Injectable({
  providedIn: 'root'
})
export class IncidenteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/incidentes`;

  getSolicitudesPendientes(): Observable<IncidenteDetalle[]> {
    return this.http.get<IncidenteDetalle[]>(`${this.apiUrl}/solicitudes-pendientes`);
  }

  asignarTaller(incidenteId: number, tallerId: number): Observable<IncidenteDetalle> {
    return this.http.patch<IncidenteDetalle>(`${this.apiUrl}/${incidenteId}/asignar-taller`, { taller_id: tallerId });
  }

  solicitarCotizacion(incidenteId: number, tallerId: number): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.apiUrl}/${incidenteId}/solicitar-cotizacion`, { taller_id: tallerId });
  }

  ofrecerCotizacion(incidenteId: number, monto: number, mensaje?: string, tiempo_estimado?: string): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.apiUrl}/${incidenteId}/ofrecer-cotizacion`, { monto, mensaje, tiempo_estimado });
  }

  aceptarCotizacion(cotizacionId: number): Observable<IncidenteDetalle> {
    return this.http.post<IncidenteDetalle>(`${this.apiUrl}/cotizaciones/${cotizacionId}/aceptar`, {});
  }

  getMantenimientosTaller(): Observable<IncidenteDetalle[]> {
    return this.http.get<IncidenteDetalle[]>(`${this.apiUrl}/mantenimientos`);
  }

  actualizarEstadoIncidente(incidenteId: number, estado: string): Observable<IncidenteDetalle> {
    return this.http.patch<IncidenteDetalle>(`${this.apiUrl}/${incidenteId}/estado-taller`, { estado });
  }

  asignarMecanicosIncidente(incidenteId: number, mecanicoIds: number[]): Observable<IncidenteDetalle> {
    return this.http.post<IncidenteDetalle>(`${this.apiUrl}/${incidenteId}/asignar-mecanicos`, { mecanico_ids: mecanicoIds });
  }

  getMisIncidentes(): Observable<IncidenteDetalle[]> {
    return this.http.get<IncidenteDetalle[]>(`${this.apiUrl}/mis-incidentes`);
  }

  reintentarAnalisis(incidenteId: number, nuevaDescripcion: string): Observable<IncidenteDetalle> {
    return this.http.post<IncidenteDetalle>(`${this.apiUrl}/${incidenteId}/reintentar-analisis`, { nueva_descripcion: nuevaDescripcion });
  }

  // --- Gestión de Servicios de Taller ---
  getCatalogoServicios(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/servicios/catalogo`);
  }

  getMisServicios(): Observable<ServicioTallerOut[]> {
    return this.http.get<ServicioTallerOut[]>(`${this.apiUrl}/mis-servicios`);
  }

  agregarServicio(nombre: string): Observable<ServicioTallerOut> {
    return this.http.post<ServicioTallerOut>(`${this.apiUrl}/mis-servicios`, { nombre });
  }

  eliminarServicio(servicioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mis-servicios/${servicioId}`);
  }

  // --- Chat ---
  getChatMessages(incidenteId: number): Observable<MensajeChat[]> {
    return this.http.get<MensajeChat[]>(`${this.apiUrl}/${incidenteId}/chat`);
  }

  sendChatMessage(incidenteId: number, contenido: string): Observable<MensajeChat> {
    return this.http.post<MensajeChat>(`${this.apiUrl}/${incidenteId}/chat`, { contenido });
  }
}

export interface MensajeChat {
  id: number;
  contenido: string;
  fecha?: string;
  incidente_id: number;
  usuario_id: number;
  nombre_usuario?: string;
  rol_usuario?: string;
}
