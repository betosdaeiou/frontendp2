import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Validar que esté logueado
  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  const role = authService.getRole();

  // 2. El Administrador tiene acceso total a todo el sistema
  if (role === 'Administrador') {
    return true;
  }

  // 3. Extraer permisos requeridos para esta sub-ruta y validar restrictivamente
  const requiredPermiso = route.data?.['requiredPermiso'];
  
  if (requiredPermiso) {
    if (authService.hasPermiso(requiredPermiso)) {
      return true;
    }
  } else {
    // Si no exige permiso especial particular pero está logueado y llegamos aquí permitimos (ej. el padre Dashboard vacio)
    if (role === 'Taller' || role === 'Mecanico' || role === 'Admin Tenant') {
      return true;
    }
  }

  // Denegar acceso y redireccionar a pagina segura
  router.navigate(['/dashboard']);
  return false;
};
