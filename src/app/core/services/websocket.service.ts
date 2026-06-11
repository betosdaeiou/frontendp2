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
  private reconnectInterval: any;
  private currentRoomId: string | null = null;
  
  public messages$ = new Subject<any>();

  connect(roomId: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    this.currentRoomId = roomId;

    const tenantId = this.authService.getTenant();
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.warn('Cannot connect to WebSocket without token');
      return;
    }

    const tenantIdStr = tenantId === null ? '0' : tenantId.toString();

    // Convert http:// o https:// to ws:// o wss://
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws/${tenantIdStr}/${roomId}?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`Connected to room ${roomId}`);
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messages$.next(data);
    };

    this.socket.onclose = () => {
      console.log(`Disconnected from room ${roomId}, attempting to reconnect in 5s...`);
      this.socket = null;
      if (!this.reconnectInterval) {
        this.reconnectInterval = setInterval(() => {
          if (this.currentRoomId) this.connect(this.currentRoomId);
        }, 5000);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      // Let onclose handle the reconnect
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
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.currentRoomId = null;
    if (this.socket) {
      this.socket.onclose = null; // Prevent auto-reconnect
      this.socket.close();
      this.socket = null;
    }
  }
}
