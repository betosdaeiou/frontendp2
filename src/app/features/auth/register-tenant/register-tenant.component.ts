import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }

    .dark-input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.88);
      border-radius: 9px;
      padding: 0.72rem 0.9rem 0.72rem 2.4rem;
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.15s, background 0.15s;
      box-sizing: border-box;
    }
    .dark-input:focus {
      outline: none;
      border-color: rgba(37,99,235,0.55);
      background: rgba(37,99,235,0.06);
    }
    .dark-input::placeholder { color: rgba(255,255,255,0.2); }

    .dark-input-no-icon {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.88);
      border-radius: 9px;
      padding: 0.72rem 0.9rem;
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.15s, background 0.15s;
      box-sizing: border-box;
    }
    .dark-input-no-icon:focus {
      outline: none;
      border-color: rgba(37,99,235,0.55);
      background: rgba(37,99,235,0.06);
    }
    .dark-input-no-icon::placeholder { color: rgba(255,255,255,0.2); }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <div style="min-height:100vh; background:#0f172a; display:flex; flex-direction:column;
                align-items:center; justify-content:center; padding:2rem 1.5rem;
                position:relative; overflow:hidden;">

      <!-- Glow sutil -->
      <div style="position:absolute; inset:0; pointer-events:none; overflow:hidden;">
        <div style="position:absolute; top:-10%; left:50%; transform:translateX(-50%);
                    width:600px; height:350px; border-radius:50%;
                    background:rgba(37,99,235,0.11); filter:blur(80px);"></div>
      </div>

      <!-- Back to home -->
      <div style="position:absolute; top:1.4rem; left:1.8rem; z-index:10;">
        <a routerLink="/"
           style="display:inline-flex; align-items:center; gap:0.4rem;
                  color:rgba(255,255,255,0.4); font-size:0.82rem; font-weight:500;
                  text-decoration:none; transition:color 0.15s;"
           onmouseover="this.style.color='rgba(255,255,255,0.75)'"
           onmouseout="this.style.color='rgba(255,255,255,0.4)'">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Volver al inicio
        </a>
      </div>

      <div style="width:100%; max-width:460px; position:relative; z-index:1;" class="animate-fade-in">

        <!-- Logo + título -->
        <div style="text-align:center; margin-bottom:2.2rem;">
          <div style="width:40px; height:40px; border-radius:10px; background:#2563eb;
                      display:inline-flex; align-items:center; justify-content:center;
                      margin-bottom:1.2rem;">
            <svg width="21" height="21" fill="none" stroke="white" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375
                   a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0
                   a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124
                   a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25
                   M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106
                   a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635
                   m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
            </svg>
          </div>
          <h1 style="font-size:1.55rem; font-weight:800; color:rgba(255,255,255,0.92);
                     letter-spacing:-0.025em; margin:0 0 0.4rem;">
            Crea tu cuenta empresarial
          </h1>
          <p style="font-size:0.875rem; color:rgba(255,255,255,0.42); margin:0; font-weight:400;">
            Registra tu red de talleres y activa tu plan
          </p>
        </div>

        <!-- Error -->
        @if (errorMessage) {
          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25);
                      border-radius:10px; padding:0.8rem 1rem; margin-bottom:1.4rem;
                      display:flex; align-items:flex-start; gap:0.6rem;"
               class="animate-fade-in">
            <svg width="16" height="16" fill="none" stroke="#f87171" stroke-width="2"
                 viewBox="0 0 24 24" style="flex-shrink:0; margin-top:1px;">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <span style="font-size:0.85rem; color:#f87171; line-height:1.5;">{{ errorMessage }}</span>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()"
              style="background:#1e293b; border:1px solid rgba(255,255,255,0.07);
                     border-radius:14px; padding:2rem;">

          <!-- Nombre del Tenant -->
          <div style="margin-bottom:1.2rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600;
                          color:rgba(255,255,255,0.5); text-transform:uppercase;
                          letter-spacing:0.07em; margin-bottom:0.5rem;">
              Nombre de la Red de Talleres
            </label>
            <div style="position:relative;">
              <div style="position:absolute; left:0.85rem; top:50%; transform:translateY(-50%); pointer-events:none;">
                <svg width="15" height="15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
                </svg>
              </div>
              <input type="text" formControlName="tenant_nombre" class="dark-input" placeholder="Ej. Mecánicos del Sur">
            </div>
          </div>

          <!-- Nombre y Apellidos admin (fila) -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.2rem;">
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:600;
                            color:rgba(255,255,255,0.5); text-transform:uppercase;
                            letter-spacing:0.07em; margin-bottom:0.5rem;">
                Nombre Admin
              </label>
              <input type="text" formControlName="admin_nombre" class="dark-input-no-icon" placeholder="Tu nombre">
            </div>
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:600;
                            color:rgba(255,255,255,0.5); text-transform:uppercase;
                            letter-spacing:0.07em; margin-bottom:0.5rem;">
                Apellidos Admin
              </label>
              <input type="text" formControlName="admin_apellidos" class="dark-input-no-icon" placeholder="Tus apellidos">
            </div>
          </div>

          <!-- Correo -->
          <div style="margin-bottom:1.2rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600;
                          color:rgba(255,255,255,0.5); text-transform:uppercase;
                          letter-spacing:0.07em; margin-bottom:0.5rem;">
              Correo electrónico
            </label>
            <div style="position:relative;">
              <div style="position:absolute; left:0.85rem; top:50%; transform:translateY(-50%); pointer-events:none;">
                <svg width="15" height="15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              <input type="email" formControlName="admin_correo" class="dark-input" placeholder="admin@tured.com">
            </div>
          </div>

          <!-- Contraseña -->
          <div style="margin-bottom:0.8rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600;
                          color:rgba(255,255,255,0.5); text-transform:uppercase;
                          letter-spacing:0.07em; margin-bottom:0.5rem;">
              Contraseña
            </label>
            <div style="position:relative;">
              <div style="position:absolute; left:0.85rem; top:50%; transform:translateY(-50%); pointer-events:none;">
                <svg width="15" height="15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
              </div>
              <input #pwdInput type="password" formControlName="admin_password" class="dark-input" placeholder="••••••••" style="padding-right:2.5rem;">
              <button type="button" (click)="pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'"
                      style="position:absolute; right:0.5rem; top:50%; transform:translateY(-50%);
                             background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.4);
                             padding:0.4rem; display:flex; align-items:center; justify-content:center;
                             transition:color 0.2s;"
                      onmouseover="this.style.color='rgba(255,255,255,0.8)'"
                      onmouseout="this.style.color='rgba(255,255,255,0.4)'"
                      tabindex="-1">
                @if (pwdInput.type === 'password') {
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                } @else {
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <!-- Submit -->
          <div style="margin-top:1.6rem;">
            <button type="submit" [disabled]="registerForm.invalid || isSubmitting || !registerForm.get('plan_id')?.value"
              style="width:100%; background:#2563eb; color:white; border:none;
                     border-radius:9px; padding:0.8rem 1rem; font-size:0.93rem;
                     font-weight:700; cursor:pointer; display:flex; align-items:center;
                     justify-content:center; gap:0.5rem;
                     box-shadow:0 4px 18px rgba(37,99,235,0.35);
                     transition:background-color 0.2s, transform 0.15s, opacity 0.2s;
                     font-family:inherit;"
              onmouseover="if(!this.disabled){ this.style.backgroundColor='#1d4ed8'; this.style.transform='translateY(-1px)'; }"
              onmouseout="if(!this.disabled){ this.style.backgroundColor='#2563eb'; this.style.transform='translateY(0)'; }">
              @if (isSubmitting) {
                <span style="width:17px; height:17px; border:2px solid rgba(255,255,255,0.3);
                             border-top-color:white; border-radius:50%; display:inline-block;
                             animation:spin 0.7s linear infinite;"></span>
                Procesando pago...
              } @else {
                Continuar al Pago
                <svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              }
            </button>
          </div>

        </form>

        <!-- Footer link -->
        <p style="text-align:center; font-size:0.85rem; color:rgba(255,255,255,0.32);
                  margin-top:1.4rem; font-weight:400;">
          ¿Ya tienes una cuenta?
          <a routerLink="/login"
             style="color:#60a5fa; font-weight:600; text-decoration:none; margin-left:0.25rem;
                    transition:color 0.15s;"
             onmouseover="this.style.color='#93c5fd'"
             onmouseout="this.style.color='#60a5fa'">
            Inicia sesión
          </a>
        </p>

      </div>
    </div>
  `
})
export class RegisterTenantComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage: string | null = null;

  registerForm: FormGroup = this.fb.group({
    plan_id: [null, Validators.required],
    extra_usuarios: [0],
    extra_incidentes: [0],
    tenant_nombre: ['', Validators.required],
    admin_nombre: ['', Validators.required],
    admin_apellidos: ['', Validators.required],
    admin_correo: ['', [Validators.required, Validators.email]],
    admin_password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const plan_id = params['plan_id'] ? parseInt(params['plan_id'], 10) : 1;
      this.registerForm.patchValue({
        plan_id: plan_id,
        extra_usuarios: params['extra_usuarios'] ? parseInt(params['extra_usuarios'], 10) : 0,
        extra_incidentes: params['extra_incidentes'] ? parseInt(params['extra_incidentes'], 10) : 0
      });
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const v = this.registerForm.value;

    const payload = {
      plan_id: v.plan_id,
      tenant_nombre: v.tenant_nombre,
      admin_correo: v.admin_correo,
      admin_password: v.admin_password,
      admin_nombre: v.admin_nombre,
      admin_apellidos: v.admin_apellidos,
      extra_usuarios: v.extra_usuarios,
      extra_incidentes: v.extra_incidentes
    };

    this.tenantService.registerCheckout(payload).subscribe({
      next: (res) => {
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
        } else {
          this.errorMessage = "No se pudo iniciar la sesión de pago.";
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.detail || "Ha ocurrido un error al procesar el registro.";
      }
    });
  }
}
