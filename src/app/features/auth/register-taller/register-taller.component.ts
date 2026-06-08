import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden relative">
        <!-- Floating Decoratives -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-red-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div class="p-8 relative z-10">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.673 4.673a2.25 2.25 0 01-3.182 0l-1.06-1.06a2.25 2.25 0 010-3.182l4.673-4.673m-1.458 5.75l-4.5 4.5M15.75 3.75l-6 6" />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Afiliar Taller</h2>
            <p class="text-sm text-gray-500 mt-2">Registra tu empresa para acceder al panel de control corporativo.</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            @if (errorMessage) {
              <div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ errorMessage }}
              </div>
            }

            @if (successMessage) {
              <div class="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                {{ successMessage }}
              </div>
            }

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1">Nombre Comercial *</label>
              <input type="text" formControlName="Nombre" 
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium placeholder-gray-400"
                placeholder="Ej. AutoStop Central">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1">Dirección *</label>
              <input type="text" formControlName="Direccion" 
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium placeholder-gray-400"
                placeholder="Avenida Busch Nro 345">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1" title="Capacidad de Vehículos">Aforo Máximo *</label>
                <input type="number" formControlName="Capmax" 
                  class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium"
                  placeholder="Ej. 10">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1">Coordenadas</label>
                <input type="text" formControlName="Coordenadas" 
                  class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium text-sm"
                  placeholder="Lat, Lng">
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1">Correo Administrador *</label>
              <input type="email" formControlName="Correo" 
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium placeholder-gray-400"
                placeholder="gerencia@taller.com">
            </div>

            <div class="pb-2">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 pl-1">Contraseña de Acceso *</label>
              <div class="relative">
                <input #pwdInput type="password" formControlName="Password" 
                  class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-medium placeholder-gray-400 pr-12"
                  placeholder="••••••••">
                <button type="button" (click)="pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" tabindex="-1">
                  @if (pwdInput.type === 'password') {
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || isSubmitting"
              class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
              @if (isSubmitting) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creando empresa...
              } @else {
                Registrar Taller
              }
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-8 font-medium">
            ¿Ya tienes una cuenta? 
            <a routerLink="/login" class="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterTallerComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      Nombre: ['', Validators.required],
      Direccion: ['', Validators.required],
      Capmax: [10, Validators.required],
      Coordenadas: [''],
      Correo: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.registerTaller(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = "¡Taller registrado exitosamente! Redirigiendo al login...";
        setTimeout(() => {
           this.isSubmitting = false;
           this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.detail || "Ha ocurrido un error al procesar el registro.";
      }
    });
  }
}
