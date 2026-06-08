import os
import re

path = 'src/app/features/dashboard/dashboard.component.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscamos el inicio del div de KPI CARDS
start_pattern = "          <!-- KPI CARDS -->"
# Buscamos el final de los Fake KPI CARDS (antes del MIDDLE ROW)
end_pattern = "        <!-- MIDDLE ROW -->"

start_idx = content.find(start_pattern)
end_idx = content.find(end_pattern)

new_kpi_html = """          <!-- KPI CARDS -->
          @if (kpis()) {
            <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:0.85rem; margin-bottom:1.6rem;">

              <div class="kpi-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <span style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.07em;">Incidentes</span>
                  <div style="width:30px;height:30px;border-radius:8px;background:rgba(37,99,235,0.15);display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" fill="none" stroke="#60a5fa" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                  </div>
                </div>
                <div style="font-size:2.1rem;font-weight:900;color:rgba(255,255,255,0.92);letter-spacing:-0.04em;line-height:1;margin-bottom:0.35rem;">{{ kpis()!.total_incidentes }}</div>
                <div style="font-size:0.72rem;color:#4ade80;font-weight:600;">Total histórico</div>
              </div>

              <div class="kpi-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <span style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.07em;">T. Asignación</span>
                  <div style="width:30px;height:30px;border-radius:8px;background:rgba(245,158,11,0.13);display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                </div>
                <div style="font-size:2.1rem;font-weight:900;color:rgba(255,255,255,0.92);letter-spacing:-0.04em;line-height:1;margin-bottom:0.35rem;">{{ kpis()!.tiempo_promedio_asignacion_horas }} <span style="font-size:0.9rem;">h</span></div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);font-weight:500;">Promedio</div>
              </div>

              <div class="kpi-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <span style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.07em;">T. Llegada</span>
                  <div style="width:30px;height:30px;border-radius:8px;background:rgba(34,197,94,0.13);display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" fill="none" stroke="#4ade80" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                </div>
                <div style="font-size:2.1rem;font-weight:900;color:rgba(255,255,255,0.92);letter-spacing:-0.04em;line-height:1;margin-bottom:0.35rem;">{{ kpis()!.tiempo_promedio_llegada_horas }} <span style="font-size:0.9rem;">h</span></div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);font-weight:500;">Promedio</div>
              </div>

              <div class="kpi-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <span style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.07em;">Cancelados</span>
                  <div style="width:30px;height:30px;border-radius:8px;background:rgba(239,68,68,0.13);display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                  </div>
                </div>
                <div style="font-size:2.1rem;font-weight:900;color:rgba(255,255,255,0.92);letter-spacing:-0.04em;line-height:1;margin-bottom:0.35rem;">{{ kpis()!.tasa_cancelados_porcentaje }}%</div>
                <div style="font-size:0.72rem;color:#f87171;font-weight:600;">Casos sin atender</div>
              </div>

              <div class="kpi-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <span style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.07em;">Cumplimiento SLA</span>
                  <div style="width:30px;height:30px;border-radius:8px;background:rgba(168,85,247,0.13);display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" fill="none" stroke="#a855f7" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                </div>
                <div style="font-size:2.1rem;font-weight:900;color:rgba(255,255,255,0.92);letter-spacing:-0.04em;line-height:1;margin-bottom:0.35rem;">{{ kpis()!.cumplimiento_sla_porcentaje }}%</div>
                <div style="font-size:0.72rem;color:#a855f7;font-weight:600;">En tiempo esperado</div>
              </div>

            </div>

            <!-- Tablas y Listas -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.6rem;">
              
              <div class="kpi-card" style="padding:1.3rem;">
                <h3 style="font-size:0.88rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 1rem;">Incidentes por Tipo</h3>
                <div style="display:flex;flex-direction:column;gap:0.8rem;">
                  @for (tipo of kpis()!.incidentes_por_tipo | keyvalue; track tipo.key) {
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:rgba(255,255,255,0.8);margin-bottom:0.3rem;">
                        <span>{{ tipo.key }}</span>
                        <span style="font-weight:700;">{{ tipo.value }}</span>
                      </div>
                      <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
                        <div style="height:100%;background:#3b82f6;" [style.width.%]="(tipo.value / kpis()!.total_incidentes) * 100"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="kpi-card" style="padding:1.3rem;">
                <h3 style="font-size:0.88rem;font-weight:700;color:rgba(255,255,255,0.85);margin:0 0 1rem;">Zonas con más Incidentes</h3>
                <div style="display:flex;flex-direction:column;gap:0.8rem;">
                  @for (zona of kpis()!.zonas_con_mas_incidentes | keyvalue; track zona.key) {
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem;background:rgba(255,255,255,0.03);border-radius:6px;">
                      <div style="display:flex;align-items:center;gap:0.5rem;">
                        <svg width="14" height="14" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <span style="font-size:0.75rem;color:rgba(255,255,255,0.75);">Geo: {{ zona.key }}</span>
                      </div>
                      <span style="font-size:0.75rem;font-weight:700;color:white;background:#f87171;padding:0.1rem 0.4rem;border-radius:12px;">{{ zona.value }}</span>
                    </div>
                  }
                </div>
              </div>

            </div>

          } @else if (isLoadingKpis()) {
            <div style="text-align:center; padding:3rem 0;">
              <div class="spinner" style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem;"></div>
              <p style="color:rgba(255,255,255,0.5);font-size:0.9rem;">Cargando analíticas operacionales...</p>
            </div>
          }
"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_kpi_html + "\n" + content[end_idx:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("dashboard.component.html patched successfully.")
else:
    print("Pattern not found", start_idx, end_idx)
