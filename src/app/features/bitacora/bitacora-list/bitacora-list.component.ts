import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitacoraService, BitacoraEntry } from '../../../core/services/bitacora.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bitacora-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl border border-gray-100">

      <!-- Header Section -->
      <div class="px-4 py-8 sm:px-10 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
            <span class="inline-flex items-center gap-3">
              <span class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Bitácora de Actividades
            </span>
          </h1>
          <p class="text-gray-500 text-sm md:text-base">
            @if (isAdmin) {
              Registro completo de todas las actividades del sistema.
            } @else {
              Historial de tus actividades en la plataforma.
            }
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <span class="text-sm text-gray-500 font-medium">{{ filteredEntries.length }} registros</span>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="px-4 sm:px-10 py-4 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div class="relative flex-1 w-full sm:max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-3 left-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text"
                 [(ngModel)]="searchTerm"
                 (ngModelChange)="applyFilters()"
                 placeholder="Buscar por acción, descripción o usuario..."
                 class="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all">
        </div>
        <select [(ngModel)]="filterAction"
                (ngModelChange)="applyFilters()"
                class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all appearance-none">
          <option value="">Todas las acciones</option>
          @for (action of uniqueActions; track action) {
            <option [value]="action">{{ action }}</option>
          }
        </select>
      </div>

      <!-- Table Section -->
      <div class="px-4 py-4 sm:px-10 bg-white relative">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs tracking-widest uppercase border-b border-gray-200">
                <th class="p-4 font-semibold">Fecha</th>
                <th class="p-4 font-semibold">Acción</th>
                <th class="p-4 font-semibold">Descripción</th>
                @if (isAdmin) {
                  <th class="p-4 font-semibold">Usuario</th>
                }
                <th class="p-4 font-semibold">IP</th>
                @if (isAdmin) {
                  <th class="p-4 font-semibold text-center w-20">Acción</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">

              @for (entry of filteredEntries; track entry.id) {
                <tr class="group hover:bg-gray-50/50 transition-colors duration-200">
                  <td class="p-4 whitespace-nowrap">
                    <span class="text-sm text-gray-700 font-medium">{{ entry.fecha }}</span>
                  </td>
                  <td class="p-4 whitespace-nowrap">
                    <span class="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border inline-flex items-center gap-1.5"
                          [ngClass]="getActionClasses(entry.accion)">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getActionDotClass(entry.accion)"></span>
                      {{ entry.accion }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="text-sm text-gray-600 max-w-xs block truncate" [title]="entry.descripcion">{{ entry.descripcion }}</span>
                  </td>
                  @if (isAdmin) {
                    <td class="p-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-100 to-purple-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                          {{ entry.usuario_correo?.charAt(0)?.toUpperCase() }}
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-medium text-gray-800">{{ entry.usuario_correo }}</span>
                          <span class="text-xs text-gray-400">{{ entry.usuario_rol }}</span>
                        </div>
                      </div>
                    </td>
                  }
                  <td class="p-4 whitespace-nowrap">
                    <span class="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">{{ entry.ip }}</span>
                  </td>
                  @if (isAdmin) {
                    <td class="p-4 text-center">
                      <button (click)="deleteEntry(entry.id)"
                              class="text-gray-300 hover:text-red-500 transition-colors duration-200 p-1.5 rounded-lg hover:bg-red-50"
                              title="Eliminar registro">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  }
                </tr>
              }
              @empty {
                <tr>
                  <td [attr.colspan]="isAdmin ? 6 : 4" class="p-10 text-center text-gray-400">
                    <div class="flex flex-col items-center justify-center">
                      <svg class="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-lg">No hay registros en la bitácora</p>
                      <p class="text-sm mt-1">Las actividades se registran automáticamente.</p>
                    </div>
                  </td>
                </tr>
              }

            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class BitacoraListComponent implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private authService = inject(AuthService);

  entries: BitacoraEntry[] = [];
  filteredEntries: BitacoraEntry[] = [];
  
  searchTerm = '';
  filterAction = '';
  uniqueActions: string[] = [];

  isAdmin = this.authService.getRole() === 'Administrador';

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries() {
    this.bitacoraService.getEntries().subscribe({
      next: (data) => {
        this.entries = data;
        this.uniqueActions = [...new Set(data.map(e => e.accion).filter(Boolean))];
        this.applyFilters();
      },
      error: (err) => console.error('Error loading bitacora:', err)
    });
  }

  applyFilters() {
    let result = [...this.entries];

    if (this.filterAction) {
      result = result.filter(e => e.accion === this.filterAction);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        (e.accion?.toLowerCase().includes(term)) ||
        (e.descripcion?.toLowerCase().includes(term)) ||
        (e.usuario_correo?.toLowerCase().includes(term)) ||
        (e.ip?.includes(term))
      );
    }

    this.filteredEntries = result;
  }

  deleteEntry(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de la bitácora?')) {
      this.bitacoraService.deleteEntry(id).subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== id);
          this.applyFilters();
        },
        error: () => alert('Error al eliminar el registro')
      });
    }
  }

  getActionClasses(accion: string): Record<string, boolean> {
    const map: Record<string, string> = {
      'Inicio de Sesión': 'bg-blue-50 text-blue-700 border-blue-200',
      'Registro': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Crear Usuario': 'bg-green-50 text-green-700 border-green-200',
      'Editar Usuario': 'bg-amber-50 text-amber-700 border-amber-200',
      'Eliminar Usuario': 'bg-red-50 text-red-700 border-red-200',
      'Crear Rol': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Editar Rol': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Eliminar Rol': 'bg-rose-50 text-rose-700 border-rose-200',
      'Asignar Permiso': 'bg-teal-50 text-teal-700 border-teal-200',
      'Revocar Permiso': 'bg-orange-50 text-orange-700 border-orange-200',
      'Crear Mecánico': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Editar Mecánico': 'bg-lime-50 text-lime-700 border-lime-200',
      'Eliminar Mecánico': 'bg-pink-50 text-pink-700 border-pink-200',
    };
    const classes = map[accion] || 'bg-gray-50 text-gray-700 border-gray-200';
    return classes.split(' ').reduce((acc, cls) => ({ ...acc, [cls]: true }), {} as Record<string, boolean>);
  }

  getActionDotClass(accion: string): Record<string, boolean> {
    const map: Record<string, string> = {
      'Inicio de Sesión': 'bg-blue-500',
      'Registro': 'bg-emerald-500',
      'Crear Usuario': 'bg-green-500',
      'Editar Usuario': 'bg-amber-500',
      'Eliminar Usuario': 'bg-red-500',
      'Crear Rol': 'bg-indigo-500',
      'Editar Rol': 'bg-yellow-500',
      'Eliminar Rol': 'bg-rose-500',
      'Asignar Permiso': 'bg-teal-500',
      'Revocar Permiso': 'bg-orange-500',
      'Crear Mecánico': 'bg-cyan-500',
      'Editar Mecánico': 'bg-lime-500',
      'Eliminar Mecánico': 'bg-pink-500',
    };
    const cls = map[accion] || 'bg-gray-500';
    return { [cls]: true };
  }
}
