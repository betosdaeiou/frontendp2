import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, ReporteStats } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 md:p-10 bg-gray-50 min-h-full">
      <!-- Header -->
      <div class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Reportes de Rendimiento</h1>
          <p class="text-gray-500 mt-2 font-medium">Visualiza el impacto y crecimiento de tu taller en la plataforma.</p>
        </div>
        
        <!-- Export Buttons -->
        <div class="flex flex-wrap gap-3">
          <button (click)="exportar('csv')" class="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
          <button (click)="exportar('xml')" class="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            XML
          </button>
          <button (click)="exportar('pdf')" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      } @else if (stats) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <!-- Card 1: Ingresos -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">Ingresos</span>
            </div>
            <div class="text-3xl font-black text-gray-900 mb-1">Bs. {{ stats.resumen.ingresos_totales }}</div>
            <p class="text-sm text-gray-400 font-medium">Ganancia total acumulada</p>
          </div>

          <!-- Card 2: Incidentes Resueltos -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-emerald-200 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Éxito</span>
            </div>
            <div class="text-3xl font-black text-gray-900 mb-1">{{ stats.resumen.resueltos }}</div>
            <p class="text-sm text-gray-400 font-medium">Incidentes finalizados</p>
          </div>

          <!-- Card 3: Balance Plataforma -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-amber-200 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">Balance</span>
            </div>
            <div class="text-3xl font-black mb-1" [ngClass]="stats.resumen.balance_plataforma >= 0 ? 'text-gray-900' : 'text-red-600'">
              Bs. {{ stats.resumen.balance_plataforma }}
            </div>
            <p class="text-sm text-gray-400 font-medium">Saldo en la plataforma</p>
          </div>

          <!-- Card 4: Total Solicitudes -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">Actividad</span>
            </div>
            <div class="text-3xl font-black text-gray-900 mb-1">{{ stats.resumen.total_incidentes }}</div>
            <p class="text-sm text-gray-400 font-medium">Total incidentes asignados</p>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Chart: Histórico 7 Días -->
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span class="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Tendencia de Incidentes (7 días)
            </h3>
            
            <div class="flex items-end justify-between h-64 gap-2 pt-4">
              @for (day of stats.historico_7_dias; track day.fecha) {
                <div class="flex-1 flex flex-col items-center group">
                  <div class="relative w-full flex justify-center items-end h-full px-1">
                    <!-- Tooltip -->
                    <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded-lg pointer-events-none mb-2">
                      {{ day.cantidad }} inc.
                    </div>
                    <!-- Bar -->
                    <div 
                      class="w-full bg-blue-500 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500"
                      [style.height.%]="getBarHeight(day.cantidad)">
                    </div>
                  </div>
                  <div class="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{{ formatDay(day.fecha) }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Chart: Distribución por Estado -->
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span class="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
              Distribución de Estados
            </h3>
            
            <div class="space-y-6">
              @for (entry of stats.por_estado | keyvalue; track entry.key) {
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-700">{{ entry.key }}</span>
                    <span class="text-sm font-black text-gray-900">{{ entry.value }}</span>
                  </div>
                  <div class="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-emerald-500 rounded-full"
                      [style.width.%]="(entry.value / stats.resumen.total_incidentes) * 100">
                    </div>
                  </div>
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
  stats: ReporteStats | null = null;
  loading = true;

  ngOnInit() {
    this.reporteService.getStatsTaller().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
    this.reporteService.exportar(formato);
  }
}
