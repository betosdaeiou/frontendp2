import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 top-[-100px] left-[-100px] animate-pulse"></div>
      <div class="absolute w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 bottom-[-100px] right-[-100px] animate-pulse" style="animation-delay: 2s;"></div>

      <div class="max-w-md w-full backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white tracking-tight">Recuperar Contraseña</h2>
          <p class="text-gray-400 mt-2 text-sm font-medium">Ingresa tu correo y te enviaremos un enlace</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="leading-tight">{{ successMessage }}</span>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="leading-tight">{{ error }}</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6" *ngIf="!successMessage">
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                formControlName="correo"
                class="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-600 block" 
                placeholder="usuario@dominio.com">
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="form.invalid || isLoading"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-3">
            <ng-container *ngIf="!isLoading">
              Enviar Enlace
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </ng-container>
            <ng-container *ngIf="isLoading">
              <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Enviando...
            </ng-container>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6 font-medium">
          <a routerLink="/login" class="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors">← Volver al Login</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  form: FormGroup;
  error: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  constructor() {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.error = null;

    this.http.post<any>(`${environment.apiUrl}/auth/solicitar-reset`, {
      correo: this.form.value.correo
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.detail || 'Error al procesar la solicitud.';
      }
    });
  }
}
