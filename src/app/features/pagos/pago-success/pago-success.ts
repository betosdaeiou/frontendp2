import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PagoService } from '../../../core/services/pago.service';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-pago-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-success.html'
})
export class PagoSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagoService = inject(PagoService);
  private tenantService = inject(TenantService);

  isVerifying = true;
  success = false;
  errorMsg = '';
  isSaaS = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const incidenteId = params['incidente_id'];
      const type = params['type'];

      if (sessionId && type === 'saas') {
        this.isSaaS = true;
        this.verificarPagoSaaS(sessionId);
      } else if (sessionId && incidenteId) {
        this.verificarPago(sessionId, +incidenteId);
      } else {
        this.isVerifying = false;
        this.errorMsg = 'Parámetros inválidos. No se puede verificar el pago.';
      }
    });
  }

  verificarPago(sessionId: string, incidenteId: number) {
    this.pagoService.confirmarPagoStripe(sessionId, incidenteId).subscribe({
      next: (res) => {
        this.isVerifying = false;
        this.success = true;
      },
      error: (err) => {
        console.error('Error al verificar pago:', err);
        this.isVerifying = false;
        this.errorMsg = 'No se pudo verificar el pago. Si realizaste el cobro, por favor contacta a soporte.';
      }
    });
  }

  verificarPagoSaaS(sessionId: string) {
    this.tenantService.confirmarSuscripcionStripe(sessionId).subscribe({
      next: (res) => {
        this.isVerifying = false;
        if (res.success) {
          this.success = true;
        } else {
          this.errorMsg = res.message || 'El pago no se pudo verificar.';
        }
      },
      error: (err) => {
        console.error('Error al verificar suscripción:', err);
        this.isVerifying = false;
        this.errorMsg = 'No se pudo verificar la suscripción. Intenta nuevamente.';
      }
    });
  }
}
