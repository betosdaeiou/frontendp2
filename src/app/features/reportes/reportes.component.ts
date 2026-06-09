import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService, ReporteStats } from '../../core/services/reporte.service';
import { AuthService } from '../../core/services/auth.service';
import { TallerService, Taller } from '../../core/services/taller.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-10 min-h-full flex flex-col h-full text-white">
      <!-- Header -->
      <div class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white/90 tracking-tight">Reportes de Rendimiento</h1>
          <p class="text-white/40 mt-2 font-medium">Visualiza el impacto y crecimiento de tu taller en la plataforma.</p>
        </div>
        
        <div class="flex items-center gap-4">
          @if (role === 'Admin Tenant') {
            <select [(ngModel)]="selectedTallerId" (change)="onTallerChange()" class="bg-[#0f172a] border border-white/10 text-white/90 px-4 py-2.5 rounded-xl text-sm focus:border-[#3b82f6] outline-none">
              <option value="">Todos los Talleres</option>
              @for (taller of talleres; track taller.Id) {
                <option [value]="taller.Id">{{ taller.Nombre }}</option>
              }
            </select>
          }
          
          <!-- Export Buttons -->
          <div class="flex flex-wrap gap-3">
          <button (click)="exportar('csv')" class="bg-white/5 border border-white/10 text-white/80 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 shadow-md backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#60a5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
          <button (click)="exportar('xml')" class="bg-white/5 border border-white/10 text-white/80 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 shadow-md backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            XML
          </button>
          <button (click)="exportar('pdf')" class="bg-[#2563eb] text-white border border-blue-500/30 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1d4ed8] shadow-[0_4px_14px_rgba(37,99,235,0.39)] transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exportar PDF
          </button>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="flex items-center justify-center py-20 flex-1">
          <div class="w-12 h-12 border-4 border-blue-500/20 border-t-[#3b82f6] rounded-full animate-spin"></div>
        </div>
      } @else if (stats) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <!-- Card 1: Ingresos -->
          <div class="bg-[#151f32] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 group hover:border-[#60a5fa]/50 transition-all relative overflow-hidden flex flex-col">
            <div class="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0"></div>
            <div class="relative z-10 flex items-center justify-between mb-4">
              <div class="p-3 bg-blue-500/10 text-[#60a5fa] border border-blue-500/20 rounded-2xl group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-[0.65rem] font-bold text-[#60a5fa] bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">Ingresos</span>
            </div>
            <div class="relative z-10 text-3xl font-black text-white/90 mb-1 tracking-tight">Bs. {{ stats.resumen.ingresos_totales }}</div>
            <p class="relative z-10 text-sm text-white/40 font-medium">Ganancia total acumulada</p>
          </div>

          <!-- Card 2: Incidentes Resueltos -->
          <div class="bg-[#151f32] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 group hover:border-emerald-500/50 transition-all relative overflow-hidden flex flex-col">
            <div class="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0"></div>
            <div class="relative z-10 flex items-center justify-between mb-4">
              <div class="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-[0.65rem] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">Éxito</span>
            </div>
            <div class="relative z-10 text-3xl font-black text-white/90 mb-1 tracking-tight">{{ stats.resumen.resueltos }}</div>
            <p class="relative z-10 text-sm text-white/40 font-medium">Incidentes finalizados</p>
          </div>

          <!-- Card 3: Total Solicitudes -->
          <div class="bg-[#151f32] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 group hover:border-purple-500/50 transition-all relative overflow-hidden flex flex-col">
            <div class="absolute -inset-px bg-gradient-to-r from-purple-500/10 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0"></div>
            <div class="relative z-10 flex items-center justify-between mb-4">
              <div class="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-[0.65rem] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">Actividad</span>
            </div>
            <div class="relative z-10 text-3xl font-black text-white/90 mb-1 tracking-tight">{{ stats.resumen.total_incidentes }}</div>
            <p class="relative z-10 text-sm text-white/40 font-medium">Total incidentes asignados</p>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Chart: Histórico 7 Días -->
          <div class="bg-[#151f32] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <h3 class="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
              <span class="w-1.5 h-6 bg-[#3b82f6] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              Tendencia de Incidentes (7 días)
            </h3>
            
            <div class="flex items-end justify-between h-64 gap-2 pt-4 border-b border-white/5 pb-1">
              @for (day of stats.historico_7_dias; track day.fecha) {
                <div class="flex-1 flex flex-col items-center group">
                  <div class="relative w-full flex justify-center items-end h-full px-1">
                    <!-- Tooltip -->
                    <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0f172a] border border-white/10 text-white/90 text-xs py-1.5 px-2.5 rounded-lg pointer-events-none mb-2 whitespace-nowrap shadow-xl z-20">
                      {{ day.cantidad }} inc.
                    </div>
                    <!-- Bar -->
                    <div 
                      class="w-full bg-blue-500/50 border border-blue-400/20 rounded-t-xl group-hover:bg-[#3b82f6] group-hover:border-[#60a5fa] transition-all duration-500 relative overflow-hidden"
                      [style.height.%]="getBarHeight(day.cantidad)">
                      <div class="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                    </div>
                  </div>
                  <div class="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">{{ formatDay(day.fecha) }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Chart: Distribución por Estado -->
          <div class="bg-[#151f32] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <h3 class="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
              <span class="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Distribución de Estados
            </h3>
            
            <div class="space-y-6">
              @for (entry of stats.por_estado | keyvalue; track entry.key) {
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-white/70">{{ entry.key }}</span>
                    <span class="text-sm font-black text-white/90">{{ entry.value }}</span>
                  </div>
                  <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      class="h-full bg-emerald-500/80 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] relative"
                      [style.width.%]="(entry.value / stats.resumen.total_incidentes) * 100">
                      <div class="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="py-10 text-center text-white/30 text-sm">
                  No hay incidentes registrados para mostrar la distribución.
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `]
})

export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);
  private authService = inject(AuthService);
  private tallerService = inject(TallerService);
  
  stats: ReporteStats | null = null;
  loading = true;
  role = this.authService.getRole();
  talleres: Taller[] = [];
  selectedTallerId: number | '' = '';

  ngOnInit() {
    if (this.role === 'Admin Tenant') {
      this.tallerService.getMisSucursales().subscribe({
        next: (talleres) => this.talleres = talleres,
        error: (e) => console.error("Error al cargar talleres", e)
      });
    }
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    const tallerId = this.selectedTallerId === '' ? undefined : this.selectedTallerId;
    this.reporteService.getStatsTaller(tallerId).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onTallerChange() {
    this.loadStats();
  }

  getBarHeight(val: number): number {
    if (!this.stats) return 0;
    const max = Math.max(...this.stats.historico_7_dias.map(d => d.cantidad), 1);
    return (val / max) * 100;
  }

  formatDay(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  }

  exportar(formato: string) {
    const tallerId = this.selectedTallerId === '' ? undefined : this.selectedTallerId;
    this.reporteService.exportar(formato, tallerId);
  }
}
