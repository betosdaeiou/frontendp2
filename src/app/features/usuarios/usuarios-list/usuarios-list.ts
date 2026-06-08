import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, Usuario, Rol } from '../../../core/services/user.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css'
})
export class UsuariosList implements OnInit {
  users: Usuario[]   = [];
  roles: Rol[]       = [];

  isModalOpen    = false;
  isEditing      = false;
  editingUserId: number | null = null;

  isSubmitting   = false;
  createError: string | null = null;

  userToDelete: Usuario | null = null;
  isDeleting     = false;

  userForm: FormGroup;
  private fb          = inject(FormBuilder);
  private userService = inject(UserService);

  constructor() {
    this.userForm = this.fb.group({
      Correo:   ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      IdRol:    ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  loadUsers() {
    this.userService.getUsers().subscribe({
      next:  (data) => this.users = data,
      error: (err)  => console.error('Error loading users:', err)
    });
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next:  (data) => this.roles = data,
      error: (err)  => console.error('Error loading roles:', err)
    });
  }

  // ── Modal crear/editar ────────────────────────────────────────────────────

  openModal(user?: Usuario) {
    this.isModalOpen  = true;
    this.createError  = null;
    this.userForm.reset();

    if (user) {
      this.isEditing     = true;
      this.editingUserId = user.Id;
      this.userForm.patchValue({ Correo: user.Correo, IdRol: user.IdRol, Password: '' });
      this.userForm.get('Password')?.clearValidators();
      this.userForm.get('Password')?.updateValueAndValidity();
    } else {
      this.isEditing     = false;
      this.editingUserId = null;
      this.userForm.get('Password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('Password')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.isSubmitting = true;
    this.createError  = null;

    const payload = {
      ...this.userForm.value,
      IdRol: parseInt(this.userForm.value.IdRol, 10)
    };
    if (this.isEditing && !payload.Password) delete payload.Password;

    const request = this.isEditing && this.editingUserId
      ? this.userService.updateUser(this.editingUserId, payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.createError  = err.error?.detail ?? 'Error al conectar con el servidor.';
      }
    });
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────

  confirmDelete(user: Usuario) {
    this.userToDelete = user;
  }

  deleteUser() {
    if (!this.userToDelete) return;
    this.isDeleting = true;
    this.userService.deleteUser(this.userToDelete.Id).subscribe({
      next: () => {
        this.users        = this.users.filter(u => u.Id !== this.userToDelete!.Id);
        this.userToDelete = null;
        this.isDeleting   = false;
      },
      error: () => {
        this.isDeleting   = false;
        this.userToDelete = null;
      }
    });
  }

  // ── Helpers de estilo ─────────────────────────────────────────────────────

  getRoleBadgeClass(rolNombre?: string): string {
    switch (rolNombre) {
      case 'Administrador': return 'role-badge role-badge-admin';
      case 'Admin Tenant':  return 'role-badge role-badge-taller'; // same style as taller for now
      case 'Taller':        return 'role-badge role-badge-taller';
      case 'Conductor':     return 'role-badge role-badge-conductor';
      case 'Mecanico':      return 'role-badge role-badge-mecanico';
      default:              return 'role-badge role-badge-default';
    }
  }

  getRoleDotColor(rolNombre?: string): string {
    switch (rolNombre) {
      case 'Administrador': return '#60a5fa';
      case 'Admin Tenant':  return '#fbbf24';
      case 'Taller':        return '#fbbf24';
      case 'Conductor':     return '#4ade80';
      case 'Mecanico':      return '#c084fc';
      default:              return 'rgba(255,255,255,0.3)';
    }
  }
}
