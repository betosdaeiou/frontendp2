import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { openDB, IDBPDatabase } from 'idb';

export interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  body: any;
  headers: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  private dbPromise: Promise<IDBPDatabase>;
  private http = inject(HttpClient);
  public isOnline = navigator.onLine;

  constructor() {
    this.dbPromise = openDB('offline-sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('requests')) {
          db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        }
      },
    });

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async saveRequest(url: string, method: string, body: any, headers: any) {
    const db = await this.dbPromise;
    await db.add('requests', {
      url,
      method,
      body,
      headers,
      timestamp: Date.now()
    });
  }

  async syncPendingRequests() {
    const db = await this.dbPromise;
    const tx = db.transaction('requests', 'readwrite');
    const store = tx.objectStore('requests');
    const requests: OfflineRequest[] = await store.getAll();

    if (requests.length === 0) return;

    // Ordenar por fecha
    requests.sort((a, b) => a.timestamp - b.timestamp);

    for (const req of requests) {
      try {
        if (req.method === 'POST') {
          await this.http.post(req.url, req.body, { headers: req.headers }).toPromise();
        } else if (req.method === 'PATCH') {
          await this.http.patch(req.url, req.body, { headers: req.headers }).toPromise();
        } else if (req.method === 'DELETE') {
          await this.http.delete(req.url, { headers: req.headers }).toPromise();
        }
        
        // Si fue exitoso, eliminar de IndexedDB
        await store.delete(req.id!);
      } catch (e) {
        console.error('Error sincronizando petición', e);
        // Si hay error (como 400), podríamos detener o eliminar. Lo dejamos para reintento.
      }
    }
  }
}
