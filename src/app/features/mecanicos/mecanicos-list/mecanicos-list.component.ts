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
    <div class="bg-gray-50 flex flex-col gap-6 p-4 md:p-8 min-h-full">
      <div class="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl border border-gray-100 flex-1 flex flex-col">
        <div class="px-6 py-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 mb-1">
              Personal Técnico
            </h1>
            <p class="text-gray-500 text-sm">Gestiona la información de tus mecánicos y operarios.</p>
          </div>
          <button (click)="openModal()" class="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform shadow-md bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Contratar Mecánico
          </button>
        </div>

        <div class="p-6 flex-1 bg-white overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (meca of mecanicos; track meca.id) {
              <div class="bg-white border hover:border-orange-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl">
                      {{ meca.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{{ meca.nombre }} {{ meca.apellidos }}</h3>
                      <p class="text-xs text-gray-500">C.I: {{ meca.ci }} {{ meca.extci }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="openModal(meca)" class="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button (click)="deleteMecanico(meca.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Dar de baja">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="col-span-full py-16 text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 opacity-20">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                No tienes técnicos registrados actualmente en este taller.
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    @if (isModalOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
        
        <div class="relative w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 z-10 max-h-[90vh] overflow-y-auto hidden-scrollbar">
          <h2 class="text-xl font-bold text-gray-900 mb-6">
            @if (isEditing) { Editar Técnico } @else { Registro de Mecánico }
          </h2>

          <form [formGroup]="form" (ngSubmit)="submitForm()">
            @if (errorMessage) {
              <div class="mb-4 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm border border-red-100">{{ errorMessage }}</div>
            }
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Nombres *</label>
                  <input type="text" formControlName="nombre" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Apellidos *</label>
                  <input type="text" formControlName="apellidos" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Doc Identidad *</label>
                  <input type="number" formControlName="ci" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Ext</label>
                  <input type="text" formControlName="extci" placeholder="LP" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Fecha Nacimiento (Opcional)</label>
                <input type="date" formControlName="fechanac_string" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
              </div>

              @if (!isEditing) {
                <div class="pt-4 border-t border-gray-100">
                  <h3 class="text-sm font-semibold text-gray-800 mb-3">Accesos del Sistema</h3>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Correo Electrónico *</label>
                    <input type="email" formControlName="correo" placeholder="mecanico@taller.com" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/50">
                  </div>
                  <div class="mt-3">
                    <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Contraseña *</label>
                    <div class="relative">
                      <input #pwdInput type="password" formControlName="password" class="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 focus:ring-2 focus:ring-orange-500/50">
                      <button type="button" (click)="pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'"
                              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" tabindex="-1">
                        @if (pwdInput.type === 'password') {
                          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        } @else {
                          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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
              <button type="button" (click)="closeModal()" class="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-medium">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || isSubmitting" class="px-5 py-2.5 rounded-xl font-semibold bg-orange-600 text-white hover:bg-orange-700 shadow-sm disabled:opacity-50 transition-colors">
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
  `]
})
export class MecanicosListComponent implements OnInit {
  mecanicos: Mecanico[] = [];
  
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
         // Asumiendo que guardamos en milisegundos. (Si es en segundos: meca.fechanac * 1000)
         // Para simplificar la fecha local del input
         const isoStr = new Date(meca.fechanac).toISOString();
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

    let fechanac_epoch: number | undefined = undefined;
    if (payload.fechanac_string) {
       // Convertimos el YYYY-MM-DD del date picker devuelta a milisegundos Integer
       fechanac_epoch = new Date(payload.fechanac_string).getTime();
    }

    const request = this.isEditing && this.editingId
      ? this.mecanicoService.updateMecanico(this.editingId, {
          nombre: payload.nombre,
          apellidos: payload.apellidos,
          ci: payload.ci,
          extci: payload.extci,
          fechanac: fechanac_epoch
        })
      : this.mecanicoService.createMecanico({
          ...payload,
          fechanac: fechanac_epoch
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
