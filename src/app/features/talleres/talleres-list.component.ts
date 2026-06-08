import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TallerService, Taller } from '../../core/services/taller.service';

@Component({
  selector: 'app-talleres-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './talleres-list.component.html'
})
export class TalleresListComponent implements OnInit {
  private tallerService = inject(TallerService);
  private fb = inject(FormBuilder);

  talleres = signal<Taller[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  showModal = signal(false);
  registerForm: FormGroup;
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      Nombre: ['', Validators.required],
      Direccion: ['', Validators.required],
      Capmax: [10, [Validators.required, Validators.min(1)]],
      Coordenadas: [''],
      Correo: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    this.loadTalleres();
  }

  loadTalleres() {
    this.isLoading.set(true);
    this.tallerService.getMisSucursales().subscribe({
      next: (data: Taller[]) => {
        this.talleres.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading talleres', err);
        this.isLoading.set(false);
      }
    });
  }

  openModal() {
    this.registerForm.reset({ Capmax: 10 });
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tallerService.crearSucursal(this.registerForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadTalleres();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail || 'Error al crear la sucursal');
      }
    });
  }
}
