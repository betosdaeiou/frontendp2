import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenteService, MensajeChat } from '../../core/services/incidente.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" (click)="close.emit()">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Chat del Incidente</h3>
              <p class="text-xs text-gray-500">#{{ incidenteId }}</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50" #messagesContainer>
          @if (isLoading) {
            <div class="flex items-center justify-center h-full">
              <div class="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          } @else if (mensajes.length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center">
              <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-8 h-8 text-gray-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p class="text-gray-400 text-sm font-medium">Sin mensajes aún</p>
              <p class="text-gray-300 text-xs mt-1">Envía un mensaje para iniciar la conversación</p>
            </div>
          } @else {
            @for (msg of mensajes; track msg.id) {
              <div class="flex" [class.justify-end]="msg.usuario_id === miUserId">
                <!-- Avatar (otros) -->
                @if (msg.usuario_id !== miUserId) {
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-2 text-xs font-bold"
                       [style.background-color]="getRolBg(msg.rol_usuario)"
                       [style.color]="getRolColor(msg.rol_usuario)">
                    {{ getInitials(msg.nombre_usuario) }}
                  </div>
                }

                <div class="max-w-[75%]">
                  <!-- Name + Role (otros) -->
                  @if (msg.usuario_id !== miUserId) {
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="text-xs font-bold" [style.color]="getRolColor(msg.rol_usuario)">{{ msg.nombre_usuario }}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            [style.background-color]="getRolBg(msg.rol_usuario)"
                            [style.color]="getRolColor(msg.rol_usuario)">
                        {{ msg.rol_usuario }}
                      </span>
                    </div>
                  }
                  <!-- Bubble -->
                  <div class="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                       [ngClass]="{
                         'bg-blue-600 text-white rounded-br-md': msg.usuario_id === miUserId,
                         'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md': msg.usuario_id !== miUserId
                       }">
                    {{ msg.contenido }}
                    <div class="text-[10px] mt-1 text-right"
                         [ngClass]="{'text-blue-200': msg.usuario_id === miUserId, 'text-gray-400': msg.usuario_id !== miUserId}">
                      {{ formatTime(msg.fecha) }}
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Input -->
        <div class="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
          <div class="flex items-end gap-2">
            <textarea
              [(ngModel)]="nuevoMensaje"
              placeholder="Escribe un mensaje..."
              rows="1"
              class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700 max-h-24"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            <button
              (click)="enviarMensaje()"
              [disabled]="isSending || !nuevoMensaje.trim()"
              class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 shrink-0">
              @if (isSending) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() incidenteId!: number;
  @Output() close = new EventEmitter<void>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private incidenteService = inject(IncidenteService);
  private profileService = inject(ProfileService);
  private pollingInterval: any;

  mensajes: MensajeChat[] = [];
  nuevoMensaje = '';
  isLoading = true;
  isSending = false;
  miUserId: number | null = null;

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (p) => this.miUserId = p.Id,
      error: () => {}
    });
    this.loadMessages();
    // Polling cada 5 segundos
    this.pollingInterval = setInterval(() => this.loadMessages(), 5000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  loadMessages() {
    this.incidenteService.getChatMessages(this.incidenteId).subscribe({
      next: (msgs) => {
        const hadMessages = this.mensajes.length;
        this.mensajes = msgs;
        this.isLoading = false;
        if (msgs.length > hadMessages) {
          setTimeout(() => this.scrollToBottom(), 50);
        }
      },
      error: () => this.isLoading = false
    });
  }

  enviarMensaje() {
    const text = this.nuevoMensaje.trim();
    if (!text || this.isSending) return;

    this.isSending = true;
    this.nuevoMensaje = '';

    this.incidenteService.sendChatMessage(this.incidenteId, text).subscribe({
      next: () => {
        this.isSending = false;
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.nuevoMensaje = text;
        this.isSending = false;
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enviarMensaje();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatTime(fecha?: string): string {
    if (!fecha) return '';
    try {
      const parts = fecha.split(' ');
      if (parts.length >= 2) return parts[1].substring(0, 5);
    } catch {}
    return fecha;
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  getRolColor(rol?: string): string {
    switch (rol) {
      case 'Conductor': return '#2563EB';
      case 'Admin Tenant':
      case 'Taller': return '#059669';
      case 'Mecánico': case 'Mecanico': return '#D97706';
      default: return '#6B7280';
    }
  }

  getRolBg(rol?: string): string {
    switch (rol) {
      case 'Conductor': return '#EFF6FF';
      case 'Admin Tenant':
      case 'Taller': return '#ECFDF5';
      case 'Mecánico': case 'Mecanico': return '#FFFBEB';
      default: return '#F3F4F6';
    }
  }
}
