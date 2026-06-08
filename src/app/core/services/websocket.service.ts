import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private authService = inject(AuthService);
  
  public messages$ = new Subject<any>();

  connect(roomId: string): void {
    const tenantId = this.authService.getTenant();
    const token = localStorage.getItem('access_token');

    if (!tenantId || !token) {
      console.warn('Cannot connect to WebSocket without tenantId and token');
      return;
    }

    // Convert http:// o https:// to ws:// o wss://
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws/${tenantId}/${roomId}?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`Connected to room ${roomId}`);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messages$.next(data);
    };

    this.socket.onclose = () => {
      console.log(`Disconnected from room ${roomId}`);
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
