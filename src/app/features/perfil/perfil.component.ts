import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/** Valida que nueva_contrasena === confirmar_contrasena */
const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const nueva     = group.get('nueva_contrasena')?.value;
  const confirmar = group.get('confirmar_contrasena')?.value;
  if (!nueva || !confirmar) return null;
  return nueva === confirmar ? null : { passwordsMismatch: true };
};
import { ProfileService, ProfileData } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { IncidenteService, ServicioTallerOut } from '../../core/services/incidente.service';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit, AfterViewInit, OnDestroy {
  private profileService = inject(ProfileService);
  private authService    = inject(AuthService);
  private incidenteService = inject(IncidenteService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  profile: ProfileData | null = null;
  loading          = true;
  saving           = false;
  savingUbicacion  = false;
  savingPassword   = false;
  uploadingAvatar  = false;
  deletingAccount  = false;
  showDeleteModal  = false;
  successMessage: string | null = null;
  errorMessage:   string | null = null;

  accountForm!:   FormGroup;
  adminForm!:     FormGroup;
  tallerForm!:    FormGroup;
  conductorForm!: FormGroup;
  mecanicoForm!:  FormGroup;
  passwordForm!:  FormGroup;

  private map:    L.Map    | null = null;
  private marker: L.Marker | null = null;
  mapDirty = false;
  private selectedCoords: string | null = null;

  misServicios:     ServicioTallerOut[] = [];
  catalogoServicios: string[]           = [];

  // ── Computed ──────────────────────────────────────────────────────────────

  get catalogServiciosDisponibles(): string[] {
    const actuales = this.misServicios.map(s => s.nombre);
    return this.catalogoServicios.filter(s => !actuales.includes(s));
  }

  get avatarInitial(): string {
    return this.profile ? this.profile.Correo.charAt(0).toUpperCase() : '?';
  }

  get avatarUrl(): string | null {
    if (!this.profile?.FotoPerfil) return null;
    const fp = this.profile.FotoPerfil;
    return fp.startsWith('http') ? fp : `${environment.apiUrl}/${fp}`;
  }

  get roleBadgeBg(): string {
    switch (this.profile?.rol_nombre) {
      case 'Administrador': return 'rgba(37,99,235,0.15)';
      case 'Admin Tenant':  return 'rgba(245,158,11,0.12)';
      case 'Taller':        return 'rgba(245,158,11,0.12)';
      case 'Conductor':     return 'rgba(34,197,94,0.12)';
      case 'Mecanico':      return 'rgba(168,85,247,0.12)';
      default:              return 'rgba(255,255,255,0.06)';
    }
  }

  get roleBadgeBorder(): string {
    switch (this.profile?.rol_nombre) {
      case 'Administrador': return '1px solid rgba(37,99,235,0.25)';
      case 'Admin Tenant':  return '1px solid rgba(245,158,11,0.2)';
      case 'Taller':        return '1px solid rgba(245,158,11,0.2)';
      case 'Conductor':     return '1px solid rgba(34,197,94,0.2)';
      case 'Mecanico':      return '1px solid rgba(168,85,247,0.2)';
      default:              return '1px solid rgba(255,255,255,0.1)';
    }
  }

  get roleBadgeColor(): string {
    switch (this.profile?.rol_nombre) {
      case 'Administrador': return '#60a5fa';
      case 'Admin Tenant':  return '#fbbf24';
      case 'Taller':        return '#fbbf24';
      case 'Conductor':     return '#4ade80';
      case 'Mecanico':      return '#c084fc';
      default:              return 'rgba(255,255,255,0.5)';
    }
  }

  get roleDotColor(): string {
    return this.roleBadgeColor;
  }

  /** true cuando al menos un formulario de perfil tiene cambios sin guardar */
  get hasChanges(): boolean {
    return this.accountForm.dirty
      || this.adminForm.dirty
      || this.tallerForm.dirty
      || this.conductorForm.dirty
      || this.mecanicoForm.dirty;
  }

  /** true cuando las contraseñas no coinciden y el campo de confirmación fue tocado */
  get passwordMismatch(): boolean {
    return this.passwordForm.hasError('passwordsMismatch')
      && !!this.passwordForm.get('confirmar_contrasena')?.dirty;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit() {
    this.accountForm   = this.fb.group({ Correo: [''] });
    this.adminForm     = this.fb.group({ Usuario: [''] });
    this.tallerForm    = this.fb.group({ Nombre: [''], Direccion: [''], Cap: [0], Capmax: [0], Coordenadas: [''] });
    this.conductorForm = this.fb.group({ CI: [''], Nombre: [''], Apellidos: [''], Fechanac: [''] });
    this.mecanicoForm  = this.fb.group({ Nombre: [''], Apellidos: [''], Estado: [''] });
    this.passwordForm  = this.fb.group({
      contrasena_actual:   ['', Validators.required],
      nueva_contrasena:    ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', Validators.required]
    }, { validators: passwordsMatchValidator });
    this.loadProfile();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.map) { this.map.remove(); this.map = null; }
  }

  // ── Profile load ──────────────────────────────────────────────────────────

  loadProfile() {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.populateForms();
        this.loading = false;
        if (data.rol_nombre === 'Taller') {
          setTimeout(() => this.initMap(), 120);
          this.loadServicios();
        }
      },
      error: () => {
        this.errorMessage = 'Error al cargar el perfil.';
        this.loading = false;
      }
    });
  }

  populateForms() {
    if (!this.profile) return;
    this.accountForm.patchValue({ Correo: this.profile.Correo });

    if (this.profile.administrador) {
      this.adminForm.patchValue({ Usuario: this.profile.administrador.Usuario || '' });
    }
    if (this.profile.taller) {
      this.tallerForm.patchValue({
        Nombre:      this.profile.taller.Nombre || '',
        Direccion:   this.profile.taller.Direccion || '',
        Cap:         this.profile.taller.Cap ?? 0,
        Capmax:      this.profile.taller.Capmax ?? 0,
        Coordenadas: this.profile.taller.Coordenadas || ''
      });
    }
    if (this.profile.conductor) {
      this.conductorForm.patchValue({
        CI:       this.profile.CI || '',
        Nombre:   this.profile.Nombre || '',
        Apellidos: this.profile.Apellidos || '',
        Fechanac:  this.profile.Fechanac || ''
      });
    }
    if (this.profile.mecanico) {
      this.mecanicoForm.patchValue({
        Nombre:    this.profile.Nombre || '',
        Apellidos: this.profile.Apellidos || '',
        Estado:    this.profile.mecanico.estado || 'Disponible'
      });
    }

    // Resetear estado dirty en todos los forms al cargar/recargar datos
    this.accountForm.markAsPristine();
    this.adminForm.markAsPristine();
    this.tallerForm.markAsPristine();
    this.conductorForm.markAsPristine();
    this.mecanicoForm.markAsPristine();
  }

  toggleEstadoMecanico(estado: string) {
    this.mecanicoForm.patchValue({ Estado: estado });
    this.mecanicoForm.markAsDirty();
  }

  /** Descarta todos los cambios no guardados volviendo a los datos originales */
  cancelChanges() {
    this.populateForms();
    this.clearMessages();
  }

  // ── Servicios ─────────────────────────────────────────────────────────────

  loadServicios() {
    this.incidenteService.getCatalogoServicios().subscribe(c => this.catalogoServicios = c);
    this.incidenteService.getMisServicios().subscribe(m => this.misServicios = m);
  }

  agregarServicio(nombre: string) {
    if (!nombre) return;
    this.incidenteService.agregarServicio(nombre).subscribe({
      next: (s) => { this.misServicios.push(s); this.showSuccess(`Servicio '${nombre}' agregado.`); },
      error: (e) => { this.errorMessage = e.error?.detail || 'Error al agregar servicio.'; }
    });
  }

  eliminarServicio(id: number) {
    this.incidenteService.eliminarServicio(id).subscribe({
      next: ()  => { this.misServicios = this.misServicios.filter(s => s.id !== id); this.showSuccess('Servicio eliminado.'); },
      error: (e) => { this.errorMessage = e.error?.detail || 'Error al eliminar servicio.'; }
    });
  }

  // ── Avatar ────────────────────────────────────────────────────────────────

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAvatar = true;
    this.clearMessages();
    this.profileService.uploadAvatar(file).subscribe({
      next: (data) => { this.profile = data; this.uploadingAvatar = false; this.showSuccess('Foto de perfil actualizada.'); },
      error: (e)   => { this.uploadingAvatar = false; this.errorMessage = e.error?.detail || 'Error al subir la foto.'; }
    });
  }

  // ── Password ──────────────────────────────────────────────────────────────

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    this.clearMessages();
    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (r) => { this.savingPassword = false; this.passwordForm.reset(); this.showSuccess(r.message || 'Contraseña actualizada.'); },
      error: (e) => { this.savingPassword = false; this.errorMessage = e.error?.detail || 'Error al cambiar la contraseña.'; }
    });
  }

  // ── Delete account ────────────────────────────────────────────────────────

  confirmDeleteAccount() { this.showDeleteModal = true; }

  deleteAccount() {
    this.deletingAccount = true;
    this.profileService.deleteAccount().subscribe({
      next: ()   => this.authService.logout(),
      error: (e) => { this.deletingAccount = false; this.showDeleteModal = false; this.errorMessage = e.error?.detail || 'Error al eliminar la cuenta.'; }
    });
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  initMap() {
    const el = document.getElementById('profile-map');
    if (!el || this.map) return;

    const icon = L.icon({
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    let lat = -17.7833, lng = -63.1821;
    if (this.profile?.taller?.Coordenadas) {
      try {
        const parts = this.profile.taller.Coordenadas.replace(' ', '').split(',');
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      } catch {}
    }

    this.map = L.map('profile-map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 19
    }).addTo(this.map);

    if (this.profile?.taller?.Coordenadas) {
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
      this.marker.bindPopup('<b>Ubicación actual</b>').openPopup();
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const coord = `${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
      if (this.marker) this.marker.setLatLng(e.latlng);
      else this.marker = L.marker(e.latlng, { icon }).addTo(this.map!);
      this.marker.bindPopup(`<b>Nueva ubicación</b><br>${coord}`).openPopup();
      this.selectedCoords = coord;
      this.tallerForm.patchValue({ Coordenadas: coord });
      this.mapDirty = true;
    });
  }

  // ── Save profile ──────────────────────────────────────────────────────────

  saveProfile() {
    if (!this.profile) return;
    this.saving = true;
    this.clearMessages();

    const payload: any = {};
    const acc = this.accountForm.value;
    if (acc.Correo && acc.Correo !== this.profile.Correo) payload.Correo = acc.Correo;

    if (this.profile.rol_nombre === 'Administrador') {
      payload.admin_usuario = this.adminForm.value.Usuario;
    }
    if (this.profile.rol_nombre === 'Taller') {
      const t = this.tallerForm.value;
      payload.taller_nombre      = t.Nombre;
      payload.taller_direccion   = t.Direccion;
      payload.taller_coordenadas = t.Coordenadas;
      payload.taller_cap         = t.Cap;
      payload.taller_capmax      = t.Capmax;
    }
    if (this.profile.rol_nombre === 'Conductor') {
      const c = this.conductorForm.value;
      payload.CI        = c.CI;
      payload.Nombre    = c.Nombre;
      payload.Apellidos = c.Apellidos;
      if (c.Fechanac) payload.Fechanac = c.Fechanac;
    }
    if (this.profile.rol_nombre === 'Mecanico' && this.mecanicoForm.dirty) {
      payload.mecanico_estado = this.mecanicoForm.value.Estado;
    }

    this.profileService.updateProfile(payload).subscribe({
      next: (data) => { this.profile = data; this.populateForms(); this.saving = false; this.showSuccess('¡Perfil actualizado correctamente!'); },
      error: (e)   => { this.saving = false; this.errorMessage = e.error?.detail || 'Error al guardar los cambios.'; }
    });
  }

  saveUbicacion() {
    if (!this.selectedCoords) return;
    this.savingUbicacion = true;
    this.clearMessages();
    this.profileService.updateUbicacion({
      Coordenadas: this.selectedCoords,
      Direccion:   this.tallerForm.value.Direccion || undefined
    }).subscribe({
      next: (data) => { this.profile = data; this.populateForms(); this.savingUbicacion = false; this.mapDirty = false; this.showSuccess('¡Ubicación actualizada!'); },
      error: (e)   => { this.savingUbicacion = false; this.errorMessage = e.error?.detail || 'Error al guardar la ubicación.'; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private clearMessages() { this.successMessage = null; this.errorMessage = null; }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 4000);
  }
}
