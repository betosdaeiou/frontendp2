import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfflineSyncService } from '../services/offline-sync.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const offlineSyncService = inject(OfflineSyncService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es de red (0) o timeout (504)
      if (error.status === 0 || error.status === 504 || !navigator.onLine) {
        
        // Solo guardamos peticiones que mutan datos
        if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE' || req.method === 'PUT') {
          console.warn('Sin conexión. Guardando petición en IndexedDB para luego:', req.url);
          
          const headersObj: any = {};
          req.headers.keys().forEach(k => {
            headersObj[k] = req.headers.getAll(k);
          });

          offlineSyncService.saveRequest(req.url, req.method, req.body, headersObj);

          // Retornamos un 'falso' positivo para que la UI no se rompa y crea que fue exitoso
          return of(new Object() as any);
        }
      }
      
      return throwError(() => error);
    })
  );
};
