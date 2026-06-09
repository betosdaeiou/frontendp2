import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineSyncService } from './core/services/offline-sync.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from './core/services/websocket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('emergencia-vehicular');
  public offlineSync = inject(OfflineSyncService);
  private wsService = inject(WebsocketService);
  
  toastMessage = signal<string | null>(null);

  constructor() {
    this.wsService.messages$.subscribe((msg: any) => {
      if (msg && msg.action === 'nueva_solicitud_cotizacion') {
        this.showToast('¡Nueva solicitud de cotización directa recibida!');
      } else if (msg && msg.action === 'estado_actualizado') {
        // Opcional: mostrar toast de otros eventos si quisieras
      }
    });
  }

  private showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 5000);
  }
}
