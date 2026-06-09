import { Component, OnInit, OnDestroy, AfterViewChecked, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenteService, IncidenteDetalle } from '../../core/services/incidente.service';
import { MecanicoService, Mecanico } from '../../core/services/mecanico.service';
import { PagoService } from '../../core/services/pago.service';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { ChatComponent } from '../chat/chat.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './mantenimientos.component.html'
})
export class MantenimientosComponent implements OnInit, OnDestroy, AfterViewChecked {
  private incidenteService = inject(IncidenteService);
  private mecanicoService = inject(MecanicoService);
  private pagoService = inject(PagoService);
  private authService = inject(AuthService);
  private websocketService = inject(WebsocketService);
  private wsSubscription?: Subscription;

  mantenimientos: IncidenteDetalle[] = [];
  mecanicosDisponibles: Mecanico[] = [];
  
  isLoading = true;
  isUpdating = false;
  isConfirmingPago = false;
  error: string | null = null;
  role = this.authService.getRole();

  // Modal Detalles
  selectedIncidente: IncidenteDetalle | null = null;
  isDetalleModalOpen = false;
  private map: L.Map | null = null;
  private mecanicoMarker: L.Marker | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  // Asignacion de multiples mecanicos temporal store
  asignacionesPendientes: { [incidenteId: number]: number[] } = {};

  // Chat modal
  chatIncidenteId: number | null = null;

  ngOnInit(): void {
    this.cargarMantenimientos();
    if (this.role === 'Taller') {
      this.cargarMecanicosDisponibles();
    }

    this.websocketService.connect('talleres');
    this.wsSubscription = this.websocketService.messages$.subscribe((msg) => {
      if (msg && (msg.action === 'estado_actualizado' || msg.action === 'taller_asignado' || msg.action === 'cotizacion_aceptada')) {
        this.cargarMantenimientos();
      } else if (msg && msg.action === 'telemetria') {
        if (this.isDetalleModalOpen && this.selectedIncidente?.id === msg.incidente_id && this.map) {
          if (this.mecanicoMarker) {
            this.mecanicoMarker.setLatLng([msg.lat, msg.lng]);
          } else {
            const greenIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            this.mecanicoMarker = L.marker([msg.lat, msg.lng], {icon: greenIcon}).addTo(this.map)
              .bindPopup('<b>Técnico en camino</b>');
          }
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.isDetalleModalOpen && this.selectedIncidente && !this.map && this.mapContainer) {
      this.initMap(this.selectedIncidente);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  cargarMantenimientos(): void {
    this.isLoading = true;
    this.error = null;
    this.incidenteService.getMantenimientosTaller().subscribe({
      next: (data) => {
        this.mantenimientos = data;
        
        // Inicializar seleccionados
        this.mantenimientos.forEach(m => {
          this.asignacionesPendientes[m.id] = m.mecanicos?.map(mec => mec.id) || [];
        });

        this.isLoading = false;
        this.checkTracking();
      },
      error: (err) => {
        console.error('Error al cargar mantenimientos:', err);
        this.error = 'Ocurrió un error al cargar los mantenimientos. Por favor intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // --- LOCATION TRACKING FROM WEB ---
  isTrackingLocation = false;
  private geoWatchId: number | null = null;
  private enCaminoIds: number[] = [];

  checkTracking(): void {
    this.enCaminoIds = this.mantenimientos
      .filter(m => m.estado === 'en camino')
      .map(m => m.id);

    if (this.enCaminoIds.length > 0) {
      this.iniciarTransmisionUbicacion();
    } else {
      this.detenerTransmisionUbicacion();
    }
  }

  iniciarTransmisionUbicacion(): void {
    if (this.geoWatchId !== null) return;

    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada por el navegador.');
      return;
    }

    this.isTrackingLocation = true;
    this.geoWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        for (const id of this.enCaminoIds) {
          this.websocketService.sendMessage({
            action: 'telemetria',
            incidente_id: id,
            lat: lat,
            lng: lng
          });
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación (GPS Web):', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  }

  detenerTransmisionUbicacion(): void {
    if (this.geoWatchId !== null) {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
      this.isTrackingLocation = false;
    }
  }

  cargarMecanicosDisponibles(): void {
    this.mecanicoService.getMecanicos().subscribe({
      next: (data) => {
        this.mecanicosDisponibles = data.filter(m => m.estado?.toLowerCase() === 'disponible');
      },
      error: (err) => console.error('Error al cargar mecánicos:', err)
    });
  }

  getMecanicosPorTaller(tallerId: number | undefined): Mecanico[] {
    if (!tallerId) return [];
    return this.mecanicosDisponibles.filter(m => m.taller_id === tallerId);
  }

  toggleMecanicoSeleccion(incidenteId: number, mecanicoId: number, event: any) {
    const isChecked = event.target.checked;
    const current = this.asignacionesPendientes[incidenteId] || [];
    if (isChecked) {
      if (!current.includes(mecanicoId)) {
        this.asignacionesPendientes[incidenteId] = [...current, mecanicoId];
      }
    } else {
      this.asignacionesPendientes[incidenteId] = current.filter(id => id !== mecanicoId);
    }
  }

  guardarAsignacion(incidenteId: number): void {
    const mecanicosIds = this.asignacionesPendientes[incidenteId];
    this.isUpdating = true;
    
    this.incidenteService.asignarMecanicosIncidente(incidenteId, mecanicosIds).subscribe({
      next: (incidenteActualizado) => {
        const index = this.mantenimientos.findIndex(m => m.id === incidenteId);
        if (index !== -1) {
          this.mantenimientos[index] = incidenteActualizado;
        }
        this.isUpdating = false;
        alert('Técnicos asignados correctamente.');
      },
      error: (err) => {
        console.error('Error al asignar mecánicos:', err);
        alert('Hubo un error al asignar los técnicos.');
        this.isUpdating = false;
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.isUpdating = true;
    this.incidenteService.actualizarEstadoIncidente(id, nuevoEstado).subscribe({
      next: (incidenteActualizado) => {
        const index = this.mantenimientos.findIndex(m => m.id === id);
        if (index !== -1) {
          this.mantenimientos[index] = incidenteActualizado;
        }
        this.isUpdating = false;
        this.checkTracking();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Hubo un error al actualizar el estado.');
        this.isUpdating = false;
      }
    });
  }

  // --- Detalles Modal ---
  abrirModalDetalles(incidente: IncidenteDetalle): void {
    this.selectedIncidente = incidente;
    this.isDetalleModalOpen = true;
    
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  cerrarModalDetalles(): void {
    this.isDetalleModalOpen = false;
    this.selectedIncidente = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.mecanicoMarker = null;
  }

  private initMap(incidente: IncidenteDetalle): void {
    if (!incidente.coordenadagps) return;

    try {
      const coords = incidente.coordenadagps.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        this.map = L.map(this.mapContainer.nativeElement).setView([coords[0], coords[1]], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(this.map);

        L.marker([coords[0], coords[1]]).addTo(this.map)
          .bindPopup(`<b>Ubicación del Incidente</b><br>ID: #${incidente.id}`)
          .openPopup();
      }
    } catch (e) {
      console.error('Error parseando coordenadas:', e);
    }
  }

  getFotosDelIncidente(incidente: IncidenteDetalle | null): string[] {
    if (!incidente || !incidente.evidencias || incidente.evidencias.length === 0) return [];
    const fotosStr = incidente.evidencias[0].fotos;
    if (!fotosStr) return [];
    return fotosStr.split('|||').filter(url => url.trim().length > 0);
  }

  tienePagoPendiente(incidente: IncidenteDetalle): boolean {
    return incidente.pagos?.some(p => p.estado === 'Pendiente Confirmación' && p.metodo === 'Directo') || false;
  }

  confirmarPagoDirecto(incidenteId: number): void {
    if (!confirm('¿Confirmas que recibiste el pago en efectivo/transferencia del conductor?')) return;

    this.isConfirmingPago = true;
    this.pagoService.confirmarPagoDirecto(incidenteId).subscribe({
      next: () => {
        alert('Pago confirmado exitosamente. El incidente ha sido marcado como Pagado.');
        this.cargarMantenimientos();
        this.isConfirmingPago = false;
      },
      error: (err) => {
        console.error('Error al confirmar pago:', err);
        alert(err.error?.detail || 'Hubo un error al confirmar el pago.');
        this.isConfirmingPago = false;
      }
    });
  }
}
