import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MecanicoService, Mecanico } from '../../../core/services/mecanico.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mecanicos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full text-white">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-white/90 mb-1">
            Personal Técnico
          </h1>
          <p class="text-white/40 text-sm">Gestiona la información de tus mecánicos y operarios.</p>
        </div>
        <button (click)="openModal()" class="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md bg-[#2563eb] text-white hover:bg-[#1d4ed8] flex items-center gap-2 border border-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Contratar Mecánico
        </button>
      </div>

      <div class="flex-1 overflow-y-auto hidden-scrollbar pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          @for (meca of mecanicos; track meca.id) {
            <div class="bg-white/5 border border-white/10 hover:border-[#60a5fa]/50 rounded-2xl p-5 transition-all group flex flex-col relative overflow-hidden">
              <!-- Glow effect on hover -->
              <div class="absolute -inset-px bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0"></div>
              
              <div class="relative z-10 flex justify-between items-start mb-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] flex items-center justify-center font-bold text-xl shadow-inner">
                    {{ (meca.nombre || 'T').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-white/90 group-hover:text-[#60a5fa] transition-colors">{{ meca.nombre || 'Sin Nombre' }} {{ meca.apellidos || '' }}</h3>
                      @if (meca.estado === 'Disponible') {
                        <span class="px-2 py-0.5 text-[0.65rem] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Disponible</span>
                      } @else if (meca.estado === 'Ocupado') {
                        <span class="px-2 py-0.5 text-[0.65rem] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Ocupado</span>
                      } @else {
                        <span class="px-2 py-0.5 text-[0.65rem] font-bold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{{ meca.estado || 'Inactivo' }}</span>
                      }
                    </div>
                    <p class="text-xs text-white/40 mt-0.5">C.I: <span class="font-mono text-white/60">{{ meca.ci || 'N/A' }} {{ meca.extci || '' }}</span></p>
                    @if (role === 'Admin Tenant') {
                      <div class="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#60a5fa] bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                        {{ meca.taller_nombre || 'No asignado' }}
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="relative z-10 mt-auto pt-4 flex justify-end gap-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="openModal(meca)" class="p-2 text-white/40 hover:text-[#60a5fa] hover:bg-white/5 rounded-lg transition-colors" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button (click)="deleteMecanico(meca.id)" class="p-2 text-white/40 hover:text-[#f87171] hover:bg-white/5 rounded-lg transition-colors" title="Dar de baja">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-16 text-center text-white/30 bg-white/5 border border-white/5 rounded-2xl border-dashed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-3 opacity-50">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              No tienes técnicos registrados actualmente.
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    @if (isModalOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md transition-opacity" (click)="closeModal()"></div>
        
        <div class="relative w-full max-w-md bg-[#151f32] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-7 z-10 max-h-[90vh] overflow-y-auto hidden-scrollbar">
          <h2 class="text-xl font-extrabold text-white/90 mb-6 flex items-center gap-2">
            <svg width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            @if (isEditing) { Editar Técnico } @else { Registro de Técnico }
          </h2>

          <form [formGroup]="form" (ngSubmit)="submitForm()">
            @if (errorMessage) {
              <div class="mb-5 bg-red-500/10 text-[#f87171] px-4 py-3 rounded-xl text-sm border border-red-500/20 font-medium">{{ errorMessage }}</div>
            }
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Nombres *</label>
                  <input type="text" formControlName="nombre" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all placeholder-white/20">
                </div>
                <div>
                  <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Apellidos *</label>
                  <input type="text" formControlName="apellidos" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all placeholder-white/20">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                  <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Doc Identidad *</label>
                  <input type="number" formControlName="ci" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all placeholder-white/20 font-mono">
                </div>
                <div>
                  <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Ext</label>
                  <input type="text" formControlName="extci" placeholder="LP" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all placeholder-white/20 text-center uppercase">
                </div>
              </div>

              <div>
                <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Fecha Nacimiento (Opcional)</label>
                <input type="date" formControlName="fechanac_string" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all style-date">
              </div>

              @if (!isEditing) {
                <div class="pt-5 mt-5 border-t border-white/5">
                  <h3 class="text-[0.7rem] font-bold text-[#60a5fa] mb-4 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                    Accesos del Sistema
                  </h3>
                  <div>
                    <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Correo Electrónico *</label>
                    <input type="email" formControlName="correo" placeholder="tecnico@taller.com" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all placeholder-white/20">
                  </div>
                  <div class="mt-4">
                    <label class="block text-[0.65rem] font-bold text-white/40 mb-1.5 uppercase tracking-widest">Contraseña *</label>
                    <div class="relative">
                      <input #pwdInput type="password" formControlName="password" class="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-white/90 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all">
                      <button type="button" (click)="pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 focus:outline-none transition-colors" tabindex="-1">
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
                </div>
              }
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="px-5 py-2.5 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors font-semibold text-sm">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || isSubmitting" class="px-5 py-2.5 rounded-xl font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[0_4px_14px_rgba(37,99,235,0.39)] disabled:opacity-50 disabled:shadow-none transition-all text-sm border border-blue-500/30">
                @if (isSubmitting) { Procesando... } @else { Confirmar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .hidden-scrollbar::-webkit-scrollbar { display: none; }
    .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    /* Dark mode date picker adjustments */
    .style-date::-webkit-calendar-picker-indicator {
      filter: invert(1) opacity(0.5);
    }
  `]
})
export class MecanicosListComponent implements OnInit {
  mecanicos: Mecanico[] = [];
  role = inject(AuthService).getRole();
  
  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;

  form: FormGroup;
  private fb = inject(FormBuilder);
  private mecanicoService = inject(MecanicoService);
  private authService = inject(AuthService);

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      ci: ['', [Validators.required, Validators.min(1000)]],
      extci: [''],
      fechanac_string: [null],
      // Credenciales solo para creación
      correo: [''],
      password: ['']
    });
  }

  ngOnInit() {
    this.loadMecanicos();
  }

  loadMecanicos() {
    this.mecanicoService.getMecanicos().subscribe({
      next: (data) => this.mecanicos = data,
      error: (e) => console.error("Error al cargar técnicos", e)
    });
  }

  openModal(meca?: Mecanico) {
    this.isModalOpen = true;
    this.errorMessage = null;
    this.form.reset();

    if (meca) {
      this.isEditing = true;
      this.editingId = meca.id;
      
      // Apagar validadores de correo y contraseña al editar
      this.form.get('correo')?.clearValidators();
      this.form.get('password')?.clearValidators();
      this.form.get('correo')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();

      // Transformar integer epoch a formato de cadena YYYY-MM-DD
      let dateString = null;
      if (meca.fechanac) {
         const fechanacVal = typeof meca.fechanac === 'string' ? new Date(meca.fechanac).getTime() : meca.fechanac;
         const isoStr = new Date(Number(fechanacVal)).toISOString();
         dateString = isoStr.split('T')[0];
      }

      this.form.patchValue({
        nombre: meca.nombre,
        apellidos: meca.apellidos,
        ci: meca.ci,
        extci: meca.extci,
        fechanac_string: dateString
      });
    } else {
      this.isEditing = false;
      this.editingId = null;
      
      // Prender validadores
      this.form.get('correo')?.setValidators([Validators.required, Validators.email]);
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
      this.form.get('correo')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitForm() {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const payload = this.form.value;

    const request = this.isEditing && this.editingId
      ? this.mecanicoService.updateMecanico(this.editingId, {
          nombre: payload.nombre,
          apellidos: payload.apellidos,
          ci: payload.ci,
          extci: payload.extci,
          fechanac: payload.fechanac_string
        })
      : this.mecanicoService.createMecanico({
          ...payload,
          fechanac: payload.fechanac_string
      });

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadMecanicos();
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.error?.detail) {
          this.errorMessage = err.error.detail;
        } else {
          this.errorMessage = "Error de conexión al guardar los datos.";
        }
      }
    });
  }

  deleteMecanico(id: number) {
    if (confirm("¿Despedir a este técnico? Perderá acceso y será borrado del sistema.")) {
      this.mecanicoService.deleteMecanico(id).subscribe({
        next: () => this.loadMecanicos(),
        error: (e) => alert(e.error?.detail || "No se pudo borrar el técnico")
      });
    }
  }
}
