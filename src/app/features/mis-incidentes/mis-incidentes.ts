import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenteService, IncidenteDetalle, Cotizacion } from '../../core/services/incidente.service';
import { PagoService } from '../../core/services/pago.service';

@Component({
  selector: 'app-mis-incidentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-incidentes.html',
  styleUrl: './mis-incidentes.css'
})
export class MisIncidentes implements OnInit {
  private incidenteService = inject(IncidenteService);
  private pagoService = inject(PagoService);

  incidentes: IncidenteDetalle[] = [];
  isLoading = true;
  isProcessingPago = false;

  /** Mapa incidente.id → texto nuevo que el conductor escribe */
  reintentarTexto: Record<number, string> = {};
  isReintentando = false;

  ngOnInit() {
    this.cargarIncidentes();
  }

  cargarIncidentes() {
    this.isLoading = true;
    this.incidenteService.getMisIncidentes().subscribe({
      next: (data) => {
        this.incidentes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando mis incidentes:', err);
        this.isLoading = false;
      }
    });
  }

  getFotosDelIncidente(incidente: IncidenteDetalle | null): string[] {
    if (!incidente || !incidente.evidencias || incidente.evidencias.length === 0) return [];
    const fotosStr = incidente.evidencias[0].fotos;
    if (!fotosStr) return [];
    return fotosStr.split('|||').filter(url => url.trim().length > 0);
  }

  getCotizacionAceptada(incidente: IncidenteDetalle): Cotizacion | undefined {
    return incidente.cotizaciones?.find(c => c.estado === 'Aceptada');
  }

  /** ¿La IA marcó este incidente como información insuficiente? */
  necesitaReanalisis(incidente: IncidenteDetalle): boolean {
    return incidente.analisis_ia?.informacion_valida === false;
  }

  reintentarAnalisis(incidente: IncidenteDetalle) {
    const texto = (this.reintentarTexto[incidente.id] || '').trim();
    if (!texto) return;

    this.isReintentando = true;
    this.incidenteService.reintentarAnalisis(incidente.id, texto).subscribe({
      next: (actualizado) => {
        const idx = this.incidentes.findIndex(i => i.id === incidente.id);
        if (idx !== -1) this.incidentes[idx] = actualizado;
        this.reintentarTexto[incidente.id] = '';
        this.isReintentando = false;
      },
      error: (err) => {
        console.error('Error al reintentar análisis:', err);
        alert(err.error?.detail || 'Error al procesar el análisis.');
        this.isReintentando = false;
      }
    });
  }

  pagarConStripe(incidenteId: number) {
    if (!confirm('Serás redirigido a Stripe para completar el pago de este servicio. ¿Continuar?')) return;
    
    this.isProcessingPago = true;
    this.pagoService.crearCheckoutStripe(incidenteId).subscribe({
      next: (res) => {
        window.location.href = res.checkout_url;
      },
      error: (err) => {
        console.error('Error al generar link de Stripe:', err);
        alert('Hubo un error al conectar con Stripe.');
        this.isProcessingPago = false;
      }
    });
  }

  pagoDirecto(incidenteId: number) {
    if (!confirm('¿Estás seguro de acordar el pago en efectivo directamente con el taller? Esto marcará el servicio como finalizado.')) return;

    this.isProcessingPago = true;
    this.pagoService.pagoDirecto(incidenteId).subscribe({
      next: () => {
        alert('Pago registrado con éxito. Gracias por usar la plataforma.');
        this.cargarIncidentes();
        this.isProcessingPago = false;
      },
      error: (err) => {
        console.error('Error al registrar pago directo:', err);
        alert(err.error?.detail || 'Hubo un error al registrar el pago directo.');
        this.isProcessingPago = false;
      }
    });
  }
}
