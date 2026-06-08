import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService, PlanSaaS, Tenant } from '../../core/services/tenant.service';
import { AuthService } from '../../core/services/auth.service';

/*
  PALETA B — tema oscuro uniforme (estilo Claude)
  ────────────────────────────────────────────────
  Fondo único          #0f172a
  Superficie cards     #1e293b
  Borde cards          rgba(255,255,255,0.08)
  Acento primario      #2563eb
  Acento secundario    #f59e0b
  Alerta               #ef4444
  Completado           #22c55e
  Texto principal      rgba(255,255,255,0.92)
  Texto secundario     rgba(255,255,255,0.50)
  ────────────────────────────────────────────────
*/

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  styles: [`
    :host { display: block; }

    .btn-primary {
      background-color: #2563eb;
      color: white;
      padding: 0.78rem 1.9rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      white-space: nowrap;
      transition: background-color 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 18px rgba(37,99,235,0.4);
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(37,99,235,0.55);
    }

    .btn-outline {
      background-color: transparent;
      color: rgba(255,255,255,0.85);
      padding: 0.78rem 1.9rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.95rem;
      border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      white-space: nowrap;
      transition: border-color 0.2s, background-color 0.2s, color 0.2s, transform 0.15s;
    }
    .btn-outline:hover {
      border-color: rgba(255,255,255,0.45);
      background-color: rgba(255,255,255,0.06);
      color: white;
      transform: translateY(-1px);
    }

    .nav-link {
      color: rgba(255,255,255,0.65);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.15s;
    }
    .nav-link:hover { color: rgba(255,255,255,0.95); }

    /* Cards oscuras */
    .f-card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 1.8rem;
      transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    }
    .f-card:hover {
      border-color: rgba(37,99,235,0.4);
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(37,99,235,0.12);
    }

    .f-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .step-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.12);
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.15rem;
      font-weight: 800;
      color: rgba(255,255,255,0.8);
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.6rem;
    }

    .section-title {
      font-size: clamp(1.7rem, 3.2vw, 2.2rem);
      font-weight: 800;
      color: rgba(255,255,255,0.92);
      letter-spacing: -0.025em;
      line-height: 1.22;
      margin: 0;
    }

    .stat-div {
      width: 1px;
      height: 44px;
      background: rgba(255,255,255,0.1);
    }

    .divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.07);
      margin: 0;
    }

    /* Cards Planes */
    .p-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto 4rem;
      padding: 0 1.5rem;
      align-items: stretch;
    }

    .p-card {
      background: #1e293b;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      position: relative;
      border: 1px solid rgba(255,255,255,0.07);
      transition: transform 0.2s, border-color 0.2s;
    }
    .p-card:hover { border-color: rgba(37,99,235,0.4); }
    
    .p-card.selected {
      border-color: #2563eb;
      border-width: 2px;
      transform: translateY(-4px);
    }

    .p-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #9ca3af;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.07);
      letter-spacing: 0.05em;
    }
    .p-card.selected .p-badge { border-color: #2563eb; color: #2563eb; }
    .p-plan-name { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.3rem; color: white; }
    .p-plan-sub { font-size: 0.85rem; color: #9ca3af; margin-bottom: 1.5rem; }
    
    .p-price-container { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1.5rem; }
    .p-price-dot { width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%); }
    .p-price { font-size: 1.8rem; font-weight: 800; color: white; }
    .p-price span { font-size: 1rem; color: #9ca3af; font-weight: 500; }

    .p-features { list-style: none; padding: 0; margin: 0 0 2rem; flex: 1; }
    .p-features li {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .p-check { color: #2563eb; flex-shrink: 0; width: 18px; height: 18px; }

    .p-custom-inputs {
      background: rgba(0,0,0,0.1);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .p-custom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }
    .p-custom-row:last-child { margin-bottom: 0; }
    .p-custom-label { font-size: 0.8rem; color: #9ca3af; font-weight: 600; }
    .p-input-mini {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      width: 60px;
      padding: 0.3rem;
      text-align: center;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .p-input-mini:focus { outline: none; border-color: #2563eb; }

    .p-card-btn {
      width: 100%;
      padding: 0.8rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      border: 1px solid #2563eb;
    }
    .p-card-btn.solid { background: #2563eb; color: white; }
    .p-card-btn.solid:hover { background: #1d4ed8; border-color: #1d4ed8; }
    .p-card-btn.outline { background: transparent; color: #60a5fa; border-color: rgba(37,99,235,0.4); }
    .p-card-btn.outline:hover { background: rgba(37,99,235,0.1); border-color: #2563eb; }

    @media (max-width: 768px) {
      .nav-center { display: none !important; }
      .stat-div   { display: none; }
    }
  `],
  template: `
  <div style="background:#0f172a; min-height:100vh;">

    <!-- ══════════ NAVBAR ══════════ -->
    <nav style="background:#0f172a; position:sticky; top:0; z-index:50;
                border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="max-width:1200px; margin:0 auto; padding:0 1.5rem;
                  height:64px; display:flex; align-items:center;
                  justify-content:space-between; gap:1rem;">

        <!-- Logo -->
        <div style="display:flex; align-items:center; gap:0.6rem; flex-shrink:0;">
          <div style="width:32px; height:32px; border-radius:8px; flex-shrink:0;
                      background:#2563eb;
                      display:flex; align-items:center; justify-content:center;">
            <svg width="17" height="17" fill="none" stroke="white" stroke-width="2.2" viewBox="0 0 24 24">
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
          <span style="font-weight:700; font-size:1.05rem; color:rgba(255,255,255,0.92); letter-spacing:-0.01em;">
            EmergenciasAuto
          </span>
        </div>

        <!-- Nav links -->
        <div class="nav-center" style="display:flex; align-items:center;
                                        gap:2rem; flex:1; justify-content:center;">
          <a href="#como-funciona"   class="nav-link">Cómo funciona</a>
          <a href="#funcionalidades" class="nav-link">Funcionalidades</a>
          <a href="#arquitectura"    class="nav-link">Arquitectura</a>
          <a href="#planes"          class="nav-link">Planes</a>
        </div>

        <!-- Right -->
        <div style="display:flex; align-items:center; gap:0.8rem; flex-shrink:0;">
          @if (isLoggedIn()) {
            <a routerLink="/dashboard" class="btn-primary"
               style="padding:0.5rem 1.1rem; font-size:0.83rem; border-radius:8px;">
              Ir al Dashboard
            </a>
          } @else {
            <a routerLink="/login" class="nav-link">Iniciar sesión</a>
            <a routerLink="/registro" class="btn-primary"
               style="padding:0.5rem 1.1rem; font-size:0.83rem; border-radius:8px;">
              Registrar
            </a>
          }
        </div>
      </div>
    </nav>

    <!-- ══════════ HERO ══════════ -->
    <section style="padding:6rem 1.5rem 0; text-align:center;
                    position:relative; overflow:hidden;">

      <!-- Subtle glow -->
      <div style="position:absolute; inset:0; pointer-events:none; overflow:hidden;">
        <div style="position:absolute; top:-5%; left:50%; transform:translateX(-50%);
                    width:700px; height:400px; border-radius:50%;
                    background:rgba(37,99,235,0.13); filter:blur(80px);"></div>
      </div>

      <div style="max-width:680px; margin:0 auto; position:relative; z-index:1;">

        <!-- Badge -->
        <div style="display:inline-flex; align-items:center; gap:0.45rem;
                    background:rgba(37,99,235,0.12);
                    border:1px solid rgba(37,99,235,0.3);
                    border-radius:9999px; padding:0.28rem 0.9rem; margin-bottom:1.8rem;">
          <span style="width:6px; height:6px; border-radius:50%;
                       background:#22c55e; display:inline-block;"></span>
          <span style="font-size:0.72rem; font-weight:600; letter-spacing:0.07em;
                       text-transform:uppercase; color:rgba(255,255,255,0.7);">
            Plataforma SaaS · Operativa 24/7
          </span>
        </div>

        <!-- Headline -->
        <h1 style="font-size:clamp(2.1rem,5vw,3.2rem); font-weight:800;
                   color:rgba(255,255,255,0.93); line-height:1.16;
                   letter-spacing:-0.03em; margin:0 0 1.3rem;">
          Atención de emergencias vehiculares para redes que operan en serio.
        </h1>

        <!-- Subtitle -->
        <p style="font-size:1rem; color:rgba(255,255,255,0.5);
                  max-width:520px; margin:0 auto 2.6rem;
                  line-height:1.78; font-weight:400;">
          Arquitectura SaaS multi-tenant que conecta conductores con redes de
          talleres mecánicos mediante IA, geolocalización y seguimiento en tiempo real.
        </p>

        <!-- CTAs -->
        <div style="display:flex; flex-wrap:wrap; gap:0.85rem;
                    justify-content:center; margin-bottom:5rem;">
          <a routerLink="/registro" class="btn-primary"
             style="padding:0.82rem 1.9rem; font-size:0.95rem; border-radius:10px;">
            Registrar
          </a>
          <a routerLink="/login" class="btn-outline"
             style="padding:0.82rem 1.9rem; font-size:0.95rem; border-radius:10px;">
            Ver demo
          </a>
        </div>
      </div>

      <!-- MOCKUP -->
      <div style="max-width:960px; margin:0 auto; position:relative; z-index:1;">

        <!-- Floating card -->
        <div style="position:absolute; left:1rem; bottom:3rem; z-index:10;
                    background:#1e293b; border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.5);
                    padding:1rem 1.1rem; width:148px;">
          <div style="font-size:0.58rem; font-weight:700; color:rgba(255,255,255,0.4);
                      text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.55rem;">
            Servicio activo
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
            <span style="width:7px; height:7px; border-radius:50%;
                         background:#f59e0b; display:inline-block;"></span>
            <span style="font-size:0.72rem; font-weight:600; color:rgba(255,255,255,0.85);">En camino</span>
          </div>
          <div style="background:rgba(37,99,235,0.15); border-radius:8px;
                      padding:0.42rem 0.6rem; margin-bottom:0.42rem;">
            <div style="font-size:0.55rem; color:rgba(255,255,255,0.4); margin-bottom:0.1rem;">ETA estimado</div>
            <div style="font-size:1.1rem; font-weight:800; color:#2563eb;">12 min</div>
          </div>
          <div style="background:rgba(245,158,11,0.12); border-radius:8px; padding:0.35rem 0.6rem;">
            <div style="font-size:0.57rem; color:#f59e0b; font-weight:700;">Mecánicos Express</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.4);">Calificación ⭐ 4.9</div>
          </div>
        </div>

        <!-- Dashboard -->
        <div style="background:#1e293b; border-radius:12px 12px 0 0;
                    border:1px solid rgba(255,255,255,0.08); border-bottom:none;
                    box-shadow:0 30px 80px rgba(0,0,0,0.6); overflow:hidden;">

          <!-- Topbar -->
          <div style="background:#0f172a; border-bottom:1px solid rgba(255,255,255,0.07);
                      padding:0.5rem 1rem; display:flex; align-items:center; gap:0.4rem;">
            <div style="width:9px;height:9px;border-radius:50%;background:#ef4444;opacity:0.8;"></div>
            <div style="width:9px;height:9px;border-radius:50%;background:#f59e0b;opacity:0.8;"></div>
            <div style="width:9px;height:9px;border-radius:50%;background:#22c55e;opacity:0.8;"></div>
            <div style="flex:1; display:flex; align-items:center;
                        justify-content:space-between; margin-left:0.8rem;">
              <div style="display:flex; gap:0.4rem;">
                <span style="background:rgba(255,255,255,0.07); border-radius:5px;
                             font-size:0.62rem; padding:0.13rem 0.52rem;
                             color:rgba(255,255,255,0.45); font-weight:500;">Pendiente (3)</span>
                <span style="background:rgba(37,99,235,0.2); border-radius:5px;
                             font-size:0.62rem; padding:0.13rem 0.52rem;
                             color:#60a5fa; font-weight:700;">En atención (5)</span>
                <span style="background:rgba(34,197,94,0.15); border-radius:5px;
                             font-size:0.62rem; padding:0.13rem 0.52rem;
                             color:#4ade80; font-weight:600;">Completado (12)</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-size:0.65rem; color:rgba(255,255,255,0.35); font-weight:500;">
                  Central de Despacho · Hoy
                </span>
                <div style="background:#2563eb; border-radius:5px; font-size:0.62rem;
                            padding:0.15rem 0.65rem; color:white; font-weight:700;">
                  Asignar Mecánico
                </div>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1e3354 40%,#1a3a4a 70%,#1a3d35 100%);
                      height:290px; position:relative; overflow:hidden;">
            <svg style="position:absolute;inset:0;width:100%;height:100%;"
                 viewBox="0 0 960 290" preserveAspectRatio="xMidYMid slice">
              <line x1="0"   y1="105" x2="960" y2="125" stroke="#3b82f6" stroke-width="2" opacity="0.25"/>
              <line x1="0"   y1="195" x2="960" y2="180" stroke="#3b82f6" stroke-width="1.5" opacity="0.18"/>
              <line x1="235" y1="0"   x2="248" y2="290" stroke="#3b82f6" stroke-width="1.8" opacity="0.22"/>
              <line x1="545" y1="0"   x2="532" y2="290" stroke="#3b82f6" stroke-width="1.5" opacity="0.18"/>
              <line x1="780" y1="0"   x2="795" y2="290" stroke="#3b82f6" stroke-width="1.5" opacity="0.16"/>

              <polyline points="55,232 135,190 235,114 332,95 448,100 545,80 652,65 758,85 862,72"
                fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
              <polyline points="85,250 170,210 268,175 375,158 465,168 562,146 660,134 758,153 848,143"
                fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
              <polyline points="38,140 110,148 195,160 296,150 392,136 490,124 608,114 705,118 820,104"
                fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

              <circle cx="235" cy="114" r="6" fill="#2563eb" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="448" cy="100" r="6" fill="#2563eb" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="652" cy="65"  r="6" fill="#2563eb" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="375" cy="158" r="6" fill="#f59e0b" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="562" cy="146" r="6" fill="#f59e0b" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="296" cy="150" r="6" fill="#22c55e" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <circle cx="608" cy="114" r="6" fill="#22c55e" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

              <circle cx="758" cy="85" r="16" fill="#ef4444" opacity="0.15"/>
              <circle cx="758" cy="85" r="9"  fill="#ef4444"/>
              <text x="758" y="89" text-anchor="middle" fill="white" font-size="10" font-weight="900">!</text>

              <circle cx="135" cy="190" r="10" fill="#1e293b" stroke="#2563eb" stroke-width="1.5"/>
              <text x="135" y="194" text-anchor="middle" fill="white" font-size="8" font-weight="700">M</text>
            </svg>

            <!-- Stats overlay -->
            <div style="position:absolute; bottom:0.9rem; right:0.9rem;
                        background:rgba(15,23,42,0.85); backdrop-filter:blur(8px);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:10px; padding:0.6rem 0.9rem;
                        display:flex; gap:1.2rem; align-items:center;">
              <div style="text-align:center;">
                <div style="font-size:0.54rem;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;">Activos</div>
                <div style="font-size:1rem;font-weight:800;color:white;">5</div>
              </div>
              <div style="width:1px;height:28px;background:rgba(255,255,255,0.1);"></div>
              <div style="text-align:center;">
                <div style="font-size:0.54rem;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;">ETA prom.</div>
                <div style="font-size:1rem;font-weight:800;color:white;">14 min</div>
              </div>
              <div style="width:1px;height:28px;background:rgba(255,255,255,0.1);"></div>
              <div style="text-align:center;">
                <div style="font-size:0.54rem;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;">Mecánicos</div>
                <div style="font-size:1rem;font-weight:800;color:white;">8</div>
              </div>
              <div style="width:1px;height:28px;background:rgba(255,255,255,0.1);"></div>
              <div style="text-align:center;">
                <div style="font-size:0.54rem;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;">Alertas</div>
                <div style="font-size:1rem;font-weight:800;color:#ef4444;">3</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════ SOCIAL PROOF ══════════ -->
    <hr class="divider" style="margin-top:0;">
    <section style="padding:1.6rem 1.5rem;">
      <div style="max-width:900px; margin:0 auto; display:flex; flex-wrap:wrap;
                  align-items:center; justify-content:center; gap:2.5rem;">
        <span style="font-size:0.73rem; font-weight:600; color:rgba(255,255,255,0.3);
                     text-transform:uppercase; letter-spacing:0.07em;">
          Con la confianza de redes en toda la región
        </span>
        @if (isLoadingTenants) {
          <span style="font-size:0.85rem; font-weight:700; color:rgba(255,255,255,0.22);">Cargando redes...</span>
        } @else if (publicTenants.length > 0) {
          @for (t of publicTenants; track t.Id) {
            <span style="font-size:0.85rem; font-weight:700; color:rgba(255,255,255,0.22);">{{ t.Nombre }}</span>
          }
        } @else {
          <span style="font-size:0.85rem; font-weight:700; color:rgba(255,255,255,0.22);">Sé la primera red en unirse</span>
        }
      </div>
    </section>
    <hr class="divider">

    <!-- ══════════ FEATURES ══════════ -->
    <section id="funcionalidades" style="padding:5.5rem 1.5rem;">
      <div style="max-width:1100px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:3.5rem;">
          <p class="section-label">Pilares funcionales</p>
          <h2 class="section-title">
            Seis razones por las que las redes<br/>de mecánicos eligen nuestra plataforma
          </h2>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.2rem;">

          <div class="f-card">
            <div class="f-icon" style="background:rgba(37,99,235,0.15);">
              <svg width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z
                     M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z
                     M13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z
                     M13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Ecosistema completo e inteligente
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              App móvil, panel web, IA, geolocalización y asignación automática de talleres
              integrados en una sola plataforma lista para operar.
            </p>
          </div>

          <div class="f-card">
            <div class="f-icon" style="background:rgba(34,197,94,0.12);">
              <svg width="20" height="20" fill="none" stroke="#4ade80" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Seguimiento en tiempo real (WebSockets)
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              GPS del auxiliar en vivo. Notificaciones instantáneas en cada cambio de estado:
              "asignado", "en camino" o "en atención".
            </p>
          </div>

          <div class="f-card">
            <div class="f-icon" style="background:rgba(245,158,11,0.12);">
              <svg width="20" height="20" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Modo Offline y sincronización (PWA)
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              Registra emergencias sin conexión. El incidente se guarda localmente y se
              sincroniza automáticamente al recuperar la señal.
            </p>
          </div>

          <div class="f-card">
            <div class="f-icon" style="background:rgba(168,85,247,0.12);">
              <svg width="20" height="20" fill="none" stroke="#c084fc" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21
                     M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75
                     M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21
                     M3 3h12m-.75 4.5H21"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Arquitectura B2B multi-tenant
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              Redes como "Auxilio Norte" o "Mecánicos Express" operan con datos, usuarios
              y métricas completamente aislados entre sí.
            </p>
          </div>

          <div class="f-card">
            <div class="f-icon" style="background:rgba(37,99,235,0.15);">
              <svg width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9
                     M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6
                     A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Analítica operacional y KPIs
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              Dashboards con tiempos promedio de llegada, talleres más eficientes y zonas
              con mayor incidencia. Decisiones basadas en datos reales.
            </p>
          </div>

          <div class="f-card">
            <div class="f-icon" style="background:rgba(239,68,68,0.12);">
              <svg width="20" height="20" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3
                     m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15
                     a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
              </svg>
            </div>
            <h3 style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.88);margin:0 0 0.45rem;">
              Autogestión de pagos y cotizaciones
            </h3>
            <p style="font-size:0.855rem;color:rgba(255,255,255,0.45);line-height:1.72;margin:0;">
              Cotización, tiempo estimado y elección de taller. El pago se procesa
              directamente desde la plataforma vía pasarela integrada.
            </p>
          </div>

        </div>
      </div>
    </section>

    <hr class="divider">

    <!-- ══════════ STATS ══════════ -->
    <section style="padding:4.5rem 1.5rem;">
      <div style="max-width:820px; margin:0 auto; display:flex; flex-wrap:wrap;
                  align-items:center; justify-content:center; row-gap:2.5rem;">

        <div style="flex:1;min-width:170px;text-align:center;padding:0 1.8rem;">
          <div style="font-size:2.6rem;font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:-0.04em;line-height:1;">40%</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:0.4rem;font-weight:500;">Reducción en tiempo<br/>de respuesta</div>
        </div>
        <div class="stat-div"></div>
        <div style="flex:1;min-width:170px;text-align:center;padding:0 1.8rem;">
          <div style="font-size:2.6rem;font-weight:900;color:#f59e0b;letter-spacing:-0.04em;line-height:1;">500+</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:0.4rem;font-weight:500;">Talleres afiliados<br/>en la red</div>
        </div>
        <div class="stat-div"></div>
        <div style="flex:1;min-width:170px;text-align:center;padding:0 1.8rem;">
          <div style="font-size:2.6rem;font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:-0.04em;line-height:1;">24/7</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:0.4rem;font-weight:500;">Disponibilidad<br/>operativa garantizada</div>
        </div>
        <div class="stat-div"></div>
        <div style="flex:1;min-width:170px;text-align:center;padding:0 1.8rem;">
          <div style="font-size:2.6rem;font-weight:900;color:#f59e0b;letter-spacing:-0.04em;line-height:1;">98%</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:0.4rem;font-weight:500;">Satisfacción de<br/>conductores atendidos</div>
        </div>

      </div>
    </section>

    <hr class="divider">

    <!-- ══════════ HOW IT WORKS ══════════ -->
    <section id="como-funciona" style="padding:5.5rem 1.5rem;">
      <div style="max-width:880px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:3.5rem;">
          <p class="section-label">Proceso simplificado</p>
          <h2 class="section-title">De la emergencia a la solución<br/>en minutos</h2>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:2rem;">

          <div style="text-align:center;">
            <div class="step-circle">1</div>
            <h4 style="font-size:0.92rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 0.4rem;">
              Conductor reporta
            </h4>
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.42);line-height:1.68;margin:0;">
              Registra el incidente desde la app, con o sin conexión. Ubicación capturada automáticamente.
            </p>
          </div>

          <div style="text-align:center;">
            <div class="step-circle">2</div>
            <h4 style="font-size:0.92rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 0.4rem;">
              IA asigna taller
            </h4>
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.42);line-height:1.68;margin:0;">
              La plataforma analiza proximidad, disponibilidad y especialidad para asignar el taller óptimo.
            </p>
          </div>

          <div style="text-align:center;">
            <div class="step-circle">3</div>
            <h4 style="font-size:0.92rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 0.4rem;">
              Mecánico en camino
            </h4>
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.42);line-height:1.68;margin:0;">
              El conductor sigue el GPS del auxiliar en tiempo real con notificaciones de cada estado.
            </p>
          </div>

          <div style="text-align:center;">
            <div class="step-circle">4</div>
            <h4 style="font-size:0.92rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 0.4rem;">
              Cotización y pago
            </h4>
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.42);line-height:1.68;margin:0;">
              Recibe la cotización, elige el taller y paga directamente desde la plataforma.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- ══════════ PLANES ══════════ -->
    <section id="planes" style="padding:5.5rem 1.5rem; background: #0f172a;">
      <div style="max-width:1200px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:3.5rem;">
          <p class="section-label">Planes de Suscripción</p>
          <h2 class="section-title">Elige el plan ideal para tu red de talleres</h2>
        </div>

        @if (isLoadingPlanes) {
          <div style="text-align:center; padding:3rem; color:#9ca3af;">Cargando planes...</div>
        } @else {
          <div class="p-grid">
            @for (plan of planes; track plan.Id) {
              
              <div class="p-card" [class.selected]="selectedPlanId === plan.Id">
                @if (selectedPlanId === plan.Id) {
                  <div class="p-badge">SELECCIONADO</div>
                }
                
                <div class="p-plan-name">Plan {{ plan.Nombre }}</div>
                <div class="p-plan-sub">Para hasta {{ getDisplayUsuarios(plan) }} usuarios</div>
                
                <div class="p-price-container">
                  <div class="p-price-dot"></div>
                  <div class="p-price">
                    \${{ getCustomPrice(plan) | number:'1.2-2' }}<span>/mes</span>
                  </div>
                </div>

                <ul class="p-features">
                  <li>
                    <svg class="p-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Módulo completo de Despacho e IA</span>
                  </li>
                  <li>
                    <svg class="p-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Hasta {{ getDisplayUsuarios(plan) }} usuarios activos</span>
                  </li>
                  <li>
                    <svg class="p-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Hasta {{ getDisplayIncidentes(plan) }} incidentes/mes</span>
                  </li>
                  <li>
                    <svg class="p-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Soporte técnico y actualizaciones</span>
                  </li>
                </ul>

                @if (plan.Nombre === 'Premium' && selectedPlanId === plan.Id) {
                  <form [formGroup]="extraForm" class="p-custom-inputs" style="margin-top:1rem;">
                    <div style="font-size:0.75rem; color:#9ca3af; margin-bottom:1rem; text-align:center;">
                      ¿Tu red superará los límites? Añade extras ($2/usuario y $0.05/incidente)
                    </div>
                    <div class="p-custom-row">
                      <span class="p-custom-label">+ Usuarios extra</span>
                      <input type="number" formControlName="extra_usuarios" class="p-input-mini" min="0">
                    </div>
                    <div class="p-custom-row">
                      <span class="p-custom-label">+ Incidentes extra</span>
                      <input type="number" formControlName="extra_incidentes" class="p-input-mini" min="0" step="50">
                    </div>
                  </form>
                }

                @if (plan.Nombre === 'Premium' && selectedPlanId === plan.Id) {
                  <button type="button" class="p-card-btn solid" (click)="continueToRegister(plan.Id)">
                    Continuar al Registro
                  </button>
                } @else {
                  <button type="button" 
                          class="p-card-btn outline"
                          (click)="selectPlan(plan)">
                    Suscríbete a Plan {{ plan.Nombre }}
                  </button>
                }
              </div>
              
            }
          </div>
        }
      </div>
    </section>

    <hr class="divider">

    <!-- ══════════ CTA FINAL ══════════ -->
    <section style="padding:6rem 1.5rem; text-align:center;">
      <div style="max-width:560px; margin:0 auto;">
        <p class="section-label">Empieza hoy</p>
        <h2 class="section-title" style="margin-bottom:1rem;">
          Tu red de talleres, operando<br/>con tecnología de primer nivel
        </h2>
        <p style="font-size:0.92rem;color:rgba(255,255,255,0.45);line-height:1.78;
                  max-width:440px;margin:0 auto 2.8rem;">
          Configura tu cuenta en menos de 5 minutos. Sin tarjeta de crédito,
          sin compromisos. Empieza gratis y escala cuando lo necesites.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:0.85rem;justify-content:center;">
          @if (isLoggedIn()) {
            <a routerLink="/dashboard" class="btn-primary"
               style="padding:0.85rem 2.1rem;font-size:0.95rem;border-radius:10px;">
              Ir al Dashboard
            </a>
          } @else {
            <a routerLink="/registro" class="btn-primary"
               style="padding:0.85rem 2.1rem;font-size:0.95rem;border-radius:10px;">
              Registrar
            </a>
            <a routerLink="/login" class="btn-outline"
               style="padding:0.85rem 2.1rem;font-size:0.95rem;border-radius:10px;">
              Iniciar sesión
            </a>
          }
        </div>
      </div>
    </section>

    <hr class="divider">

    <!-- ══════════ FOOTER ══════════ -->
    <footer style="padding:2rem 1.5rem;">
      <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;
                  justify-content:space-between;align-items:center;gap:1rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <div style="width:26px;height:26px;border-radius:6px;flex-shrink:0;
                      background:#2563eb;
                      display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
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
          <span style="font-weight:500;font-size:0.82rem;color:rgba(255,255,255,0.35);">
            EmergenciasAuto &copy; 2026
          </span>
        </div>
        <div style="display:flex;gap:1.6rem;font-size:0.82rem;font-weight:500;">
          <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.15s;"
             onmouseover="this.style.color='rgba(255,255,255,0.7)'"
             onmouseout="this.style.color='rgba(255,255,255,0.3)'">Términos de Uso</a>
          <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.15s;"
             onmouseover="this.style.color='rgba(255,255,255,0.7)'"
             onmouseout="this.style.color='rgba(255,255,255,0.3)'">Privacidad</a>
          <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.15s;"
             onmouseover="this.style.color='rgba(255,255,255,0.7)'"
             onmouseout="this.style.color='rgba(255,255,255,0.3)'">Ayuda</a>
        </div>
      </div>
    </footer>

  </div>
  `
})
export class LandingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  planes: PlanSaaS[] = [];
  isLoadingPlanes = true;
  selectedPlanId: number | null = null;
  selectedPlanName: string | null = null;

  publicTenants: Tenant[] = [];
  isLoadingTenants = true;

  extraForm: FormGroup = this.fb.group({
    extra_usuarios: [0, [Validators.min(0)]],
    extra_incidentes: [0, [Validators.min(0)]]
  });

  ngOnInit() {
    this.tenantService.getPlanes().subscribe({
      next: (planes) => {
        this.planes = planes.sort((a, b) => a.PrecioMensual - b.PrecioMensual);
        this.isLoadingPlanes = false;
      },
      error: () => {
        this.isLoadingPlanes = false;
      }
    });

    this.tenantService.getPublicTenants().subscribe({
      next: (tenants) => {
        this.publicTenants = tenants;
        this.isLoadingTenants = false;
      },
      error: () => {
        this.isLoadingTenants = false;
      }
    });
  }

  selectPlan(plan: PlanSaaS) {
    if (plan.Nombre === 'Premium') {
      this.selectedPlanId = plan.Id;
      this.selectedPlanName = plan.Nombre;
      this.extraForm.patchValue({ extra_usuarios: 0, extra_incidentes: 0 });
    } else {
      this.continueToRegister(plan.Id);
    }
  }

  getCustomPrice(plan: PlanSaaS): number {
    const base = plan.PrecioMensual / 100.0;
    if (plan.Nombre === 'Premium' && this.selectedPlanId === plan.Id) {
      const u = this.extraForm.get('extra_usuarios')?.value || 0;
      const i = this.extraForm.get('extra_incidentes')?.value || 0;
      return base + (u * 2) + (i * 0.05);
    }
    return base;
  }

  getDisplayUsuarios(plan: PlanSaaS): string | number {
    if (plan.Nombre === 'Premium' && this.selectedPlanId === plan.Id) {
      return plan.MaxUsuarios + (this.extraForm.get('extra_usuarios')?.value || 0);
    }
    return plan.MaxUsuarios === 999 ? 'ilimitados' : plan.MaxUsuarios;
  }

  getDisplayIncidentes(plan: PlanSaaS): string | number {
    if (plan.Nombre === 'Premium' && this.selectedPlanId === plan.Id) {
      return plan.MaxIncidentes + (this.extraForm.get('extra_incidentes')?.value || 0);
    }
    return plan.MaxIncidentes;
  }

  continueToRegister(planId: number) {
    const queryParams: any = { plan_id: planId };
    if (this.selectedPlanName === 'Premium' && this.selectedPlanId === planId) {
      queryParams.extra_usuarios = this.extraForm.get('extra_usuarios')?.value || 0;
      queryParams.extra_incidentes = this.extraForm.get('extra_incidentes')?.value || 0;
    }
    this.router.navigate(['/registro'], { queryParams });
  }
}
