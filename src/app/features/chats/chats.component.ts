import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenteService, ChatSummary } from '../../core/services/incidente.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <div class="flex h-[calc(100vh-100px)] bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
      <!-- Sidebar de Chats -->
      <div class="w-80 border-r border-white/10 flex flex-col bg-black/20">
        <div class="p-5 border-b border-white/10 bg-white/5">
          <h2 class="text-xl font-bold text-white drop-shadow">Bandeja de Chats</h2>
          <p class="text-xs text-blue-200/60 mt-1">Todos tus mensajes y negociaciones</p>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          @if (isLoading) {
            <div class="p-8 flex justify-center">
              <div class="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
            </div>
          } @else if (chats.length === 0) {
            <div class="p-8 text-center text-blue-200/50">
              <p class="text-sm">No tienes chats activos.</p>
            </div>
          } @else {
            @for (chat of chats; track chat.is_incidente ? 'inc_'+chat.incidente_id : 'per_'+chat.destinatario_id) {
              <div class="p-4 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                   [class.bg-blue-500/20]="isActiveChat(chat)"
                   [class.border-l-4]="isActiveChat(chat)"
                   [class.border-l-blue-400]="isActiveChat(chat)"
                   (click)="selectChat(chat)">
                <div class="flex items-start justify-between mb-1">
                  <div class="flex items-center gap-2 overflow-hidden">
                    @if (chat.is_incidente) {
                      <span class="w-2 h-2 rounded-full bg-red-400 shrink-0 shadow-[0_0_5px_rgba(248,113,113,0.8)]"></span>
                    } @else {
                      <span class="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></span>
                    }
                    <h4 class="font-bold text-sm text-gray-200 truncate">{{ chat.titulo }}</h4>
                  </div>
                  <span class="text-[10px] text-blue-200/50 shrink-0 ml-2">{{ formatTime(chat.fecha_ultimo_mensaje) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <p class="text-xs text-gray-400 truncate pr-2 flex-1">{{ chat.ultimo_mensaje }}</p>
                  @if (chat.no_leidos > 0) {
                    <span class="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">{{ chat.no_leidos }}</span>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Área de Chat Activo -->
      <div class="flex-1 bg-transparent relative">
        @if (selectedChat) {
          <app-chat
            [isModal]="false"
            [incidenteId]="selectedChat.incidente_id"
            [destinatarioId]="selectedChat.destinatario_id"
            [tituloChat]="selectedChat.titulo"
            [subtituloChat]="selectedChat.subtitulo"
          ></app-chat>
        } @else {
          <div class="flex flex-col items-center justify-center h-full text-center text-blue-200/40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-16 h-16 mb-4 text-white/10 drop-shadow">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p class="text-sm">Selecciona un chat para empezar a escribir</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `]
})
export class ChatsComponent implements OnInit {
  chats: ChatSummary[] = [];
  isLoading = true;
  selectedChat: ChatSummary | null = null;
  
  private incidenteService = inject(IncidenteService);

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.incidenteService.getMisChats().subscribe({
      next: (data) => {
        this.chats = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  selectChat(chat: ChatSummary) {
    this.selectedChat = chat;
  }

  isActiveChat(chat: ChatSummary): boolean {
    if (!this.selectedChat) return false;
    return this.selectedChat.is_incidente === chat.is_incidente && 
           this.selectedChat.incidente_id === chat.incidente_id &&
           this.selectedChat.destinatario_id === chat.destinatario_id;
  }

  formatTime(fecha?: string): string {
    if (!fecha) return '';
    try {
      const dateStr = fecha.split(' ')[0]; // YYYY-MM-DD
      return dateStr;
    } catch {}
    return fecha;
  }
}
