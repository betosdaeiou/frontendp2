import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);

  // Excluir endpoints de registro o login
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/registrar');

  if (token && !isAuthRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Invalida la sessión si el token expiró o es inválido en el backend
      if (error.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        localStorage.removeItem('permisos');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
