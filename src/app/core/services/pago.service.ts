import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PagoOut {
  id: number;
  monto_total: number;
  metodo: string;
  estado: string;
  fecha?: string;
  incidente_id: number;
  stripe_session_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;

  crearCheckoutStripe(incidenteId: number): Observable<{ checkout_url: string }> {
    return this.http.post<{ checkout_url: string }>(`${this.apiUrl}/${incidenteId}/stripe`, {});
  }

  pagoDirecto(incidenteId: number): Observable<PagoOut> {
    return this.http.post<PagoOut>(`${this.apiUrl}/${incidenteId}/directo`, {});
  }

  confirmarPagoStripe(sessionId: string, incidenteId: number): Observable<PagoOut> {
    return this.http.post<PagoOut>(`${this.apiUrl}/success?session_id=${sessionId}&incidente_id=${incidenteId}`, {});
  }

  confirmarPagoDirecto(incidenteId: number): Observable<PagoOut> {
    return this.http.post<PagoOut>(`${this.apiUrl}/${incidenteId}/confirmar-directo`, {});
  }
}
