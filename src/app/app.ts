import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineSyncService } from './core/services/offline-sync.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('emergencia-vehicular');
  public offlineSync = inject(OfflineSyncService);
}
