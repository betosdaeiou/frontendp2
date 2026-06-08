import os

path = 'src/app/core/services/incidente.service.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_interface = """export interface Cotizacion {
  id: number;
  monto?: number;
  mensaje?: string;
  estado: string;"""

new_interface = """export interface Cotizacion {
  id: number;
  monto?: number;
  mensaje?: string;
  tiempo_estimado?: string;
  estado: string;"""

content = content.replace(old_interface, new_interface)

old_method = """  ofrecerCotizacion(incidenteId: number, monto: number, mensaje?: string): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.apiUrl}/${incidenteId}/ofrecer-cotizacion`, { monto, mensaje });
  }"""

new_method = """  ofrecerCotizacion(incidenteId: number, monto: number, mensaje?: string, tiempo_estimado?: string): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.apiUrl}/${incidenteId}/ofrecer-cotizacion`, { monto, mensaje, tiempo_estimado });
  }"""

content = content.replace(old_method, new_method)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("incidente.service.ts patched")
