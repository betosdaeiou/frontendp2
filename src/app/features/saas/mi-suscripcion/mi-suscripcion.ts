import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService, Suscripcion, PlanSaaS } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-mi-suscripcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-suscripcion.html'
})
export class MiSuscripcionComponent implements OnInit {
  private tenantService = inject(TenantService);

  suscripcionActiva: Suscripcion | null = null;
  planActivo: PlanSaaS | null = null;
  planesDisponibles: PlanSaaS[] = [];
  isLoading = true;
  isProcessing = false;
  showUpgradeModal = false;

  ngOnInit() {
    this.loadSuscripcion();
  }

  loadSuscripcion() {
    this.tenantService.getSuscripciones().subscribe({
      next: (subs) => {
        // En teoria la API devuelve las suscripciones del tenant actual.
        // La suscripcion activa suele ser la última creada o la que tiene estado "Activa"
        this.suscripcionActiva = subs.find(s => s.Estado === 'Activa') || (subs.length > 0 ? subs[subs.length - 1] : null);
        
        if (this.suscripcionActiva) {
          this.loadPlan(this.suscripcionActiva.plan_id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando suscripciones', err);
        this.isLoading = false;
      }
    });
  }

  loadPlan(planId: number) {
    this.tenantService.getPlanes().subscribe({
      next: (planes) => {
        this.planesDisponibles = planes.filter(p => p.PrecioMensual > 0); // Solo planes de pago para upgrade
        this.planActivo = planes.find(p => p.Id === planId) || null;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  abrirUpgradeModal() {
    this.showUpgradeModal = true;
  }

  cerrarUpgradeModal() {
    this.showUpgradeModal = false;
  }

  gestionarFacturacion() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.tenantService.createPortalSession().subscribe({
      next: (res) => {
        if (res.portal_url) {
          window.location.href = res.portal_url;
        } else {
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('Error abriendo portal de stripe', err);
        this.isProcessing = false;
      }
    });
  }

  seleccionarPlan(planId: number) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.tenantService.createCheckoutSession(planId).subscribe({
      next: (res) => {
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
        } else {
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('Error creando checkout session', err);
        this.isProcessing = false;
      }
    });
  }
}
