import { Component, OnInit, OnDestroy, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenteService, IncidenteDetalle } from '../../core/services/incidente.service';
import { ProfileService } from '../../core/services/profile.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-solicitudes-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  template: `
    <div class="flex flex-col h-full text-white p-4 md:p-8 min-h-full">
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
              Solicitudes Pendientes
            </h1>
            <p class="text-blue-100/70 text-sm max-w-2xl">
              Incidentes reportados por conductores que aún no tienen taller asignado. Puedes ofrecer tu cotización.
            </p>
          </div>
          <button (click)="loadSolicitudes()" class="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Actualizar
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          @if (isLoading) {
            <div class="flex items-center justify-center py-20">
              <div class="flex flex-col items-center gap-3">
                <div class="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
                <p class="text-blue-200/60 text-sm font-medium animate-pulse">Cargando solicitudes...</p>
              </div>
            </div>
          }

          <!-- Error -->
          @if (errorMessage) {
            <div class="mb-6 bg-red-500/10 backdrop-blur-md text-red-400 px-4 py-3 rounded-xl text-sm border border-red-500/20 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {{ errorMessage }}
            </div>
          }

          <!-- Lista de solicitudes -->
          @if (!isLoading) {
            <div class="space-y-6">
              @for (inc of solicitudes; track inc.id) {
                <div class="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300 group">
                  <!-- Mapa embebido -->
                  @if (inc.coordenadagps) {
                    <div class="relative border-b border-white/10">
                      <div [id]="'map-inc-' + inc.id" class="h-[220px] w-full brightness-90 contrast-125 saturate-50 group-hover:saturate-100 transition-all duration-500"></div>
                      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e293b]/60 pointer-events-none"></div>
                      <div class="absolute top-3 left-3 z-[1000] bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 shadow-lg">
                        <p class="text-xs text-white font-medium flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 text-red-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          Conductor
                        </p>
                      </div>
                      @if (inc.distancia_km != null) {
                        <div class="absolute top-3 right-3 z-[1000] bg-blue-500/80 backdrop-blur-md border border-blue-400/30 text-white rounded-lg px-3 py-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          <p class="text-xs font-bold flex items-center gap-1.5 drop-shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            {{ inc.distancia_km }} km
                          </p>
                        </div>
                      }
                    </div>
                  }

                  <div class="p-6">
                    <!-- Banner de Solicitud Directa -->
                    @if (esCotizacionSolicitadaDirecta(inc)) {
                      <div class="mb-5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-start gap-3 animate-pulse">
                        <div class="bg-blue-500/20 p-2 rounded-lg shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="text-blue-300 font-bold text-sm tracking-wide">¡Cotización Solicitada Directamente!</h4>
                          <p class="text-blue-100/80 text-sm mt-1">El conductor ha solicitado específicamente que tu taller atienda este incidente.</p>
                        </div>
                      </div>
                    }

                    <!-- Header -->
                    <div class="flex justify-between items-start flex-wrap gap-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        </div>
                        <div>
                          <h3 class="font-bold text-white text-lg drop-shadow">Incidente #{{ inc.id }}</h3>
                          <p class="text-sm text-blue-200/60 flex items-center gap-1.5 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ inc.fecha || 'Sin fecha' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        @if (inc.distancia_km != null) {
                          <span class="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            {{ inc.distancia_km }} km
                          </span>
                        }
                        <span class="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_5px_rgba(248,113,113,0.8)]"></span>
                          {{ inc.estado }}
                        </span>
                      </div>
                    </div>

                    <!-- Descripción -->
                    @if (getDescripcion(inc)) {
                      <div class="mt-5 bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5 drop-shadow">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <div>
                          <p class="text-xs text-blue-200/50 font-medium uppercase tracking-wider mb-1">Descripción</p>
                          <p class="text-sm text-gray-200">{{ getDescripcion(inc) }}</p>
                        </div>
                      </div>
                    }

                    <!-- Análisis IA -->
                    @if (inc.analisis_ia) {
                      <div class="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                        <div class="flex items-center gap-2 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-indigo-400 drop-shadow">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.428-1.428L13.5 18.75l1.178-.394a2.25 2.25 0 001.428-1.428L16.5 15.75l.394 1.178a2.25 2.25 0 001.428 1.428l1.178.394-1.178.394a2.25 2.25 0 00-1.428 1.428z" />
                          </svg>
                          <h4 class="font-bold text-indigo-300 text-sm tracking-wide">Análisis Inteligente</h4>
                          
                          @if (inc.analisis_ia.NivelPrioridad) {
                            <span class="ml-auto inline-flex items-center rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                              Gravedad: {{ inc.analisis_ia.NivelPrioridad }}
                            </span>
                          }
                        </div>
                        
                        @if (inc.analisis_ia.Resumen) {
                          <p class="text-sm text-indigo-100/80 leading-relaxed">{{ inc.analisis_ia.Resumen }}</p>
                        }
                        @if (inc.analisis_ia.Clasificacion) {
                          <p class="text-sm text-indigo-100/90 leading-relaxed mt-2"><span class="font-semibold text-indigo-300">Recomendación:</span> {{ inc.analisis_ia.Clasificacion }}</p>
                        }
                      </div>
                    }

                    <!-- Evidencias count -->
                    @if (inc.evidencias.length > 0) {
                      <div class="mt-4 flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-semibold">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                          </svg>
                          {{ inc.evidencias.length }} evidencia(s)
                        </span>
                        @if (hasPhotos(inc)) {
                          <span class="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {{ getPhotoUrls(inc).length }} foto(s)
                          </span>
                        }
                      </div>

                      <!-- Photo Gallery -->
                      @if (hasPhotos(inc)) {
                        <div class="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          @for (url of getPhotoUrls(inc); track url) {
                            <div class="aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 group/img relative" (click)="openLightbox(url)">
                              <div class="absolute inset-0 bg-blue-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"></div>
                              <img [src]="url" alt="Evidencia" class="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" loading="lazy">
                            </div>
                          }
                        </div>
                      }
                    }

                    <!-- Action: Ofrecer Cotización y Chat -->
                    <div class="mt-6 pt-5 border-t border-white/10 flex justify-end gap-3">
                      <button 
                        (click)="abrirChat(inc)"
                        class="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        Negociar
                      </button>
                      @if (tallerId) {
                        @if (esCotizacionSolicitadaDirecta(inc)) {
                          <button 
                            (click)="rechazarCotizacion(inc)"
                            [disabled]="isAssigning === inc.id"
                            class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform border border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                          </button>
                        }

                        <button 
                          (click)="ofrecerCotizacion(inc)" 
                          [disabled]="isAssigning === inc.id || yaCotizado(inc)"
                          [class.from-emerald-600]="yaCotizado(inc)"
                          [class.to-teal-500]="yaCotizado(inc)"
                          class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                          @if (isAssigning === inc.id) {
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Procesando...
                          } @else if (yaCotizado(inc)) {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 drop-shadow">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Oferta Enviada
                          } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 drop-shadow">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                            </svg>
                            Ofrecer Servicio
                          }
                        </button>
                      }
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="py-24 text-center">
                  <div class="w-24 h-24 mx-auto mb-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 text-blue-300/40">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="text-white font-bold text-xl tracking-tight">No hay solicitudes pendientes</h3>
                  <p class="text-blue-200/60 text-sm mt-3 max-w-md mx-auto">Todas las emergencias tienen un taller asignado actualmente. Vuelve más tarde cuando hayan nuevos incidentes.</p>
                </div>
              }
            </div>
          }
        </div>

        <!-- Stats footer -->
        @if (!isLoading && solicitudes.length > 0) {
          <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <p class="text-sm text-blue-200/60">
              <span class="font-bold text-white">{{ solicitudes.length }}</span> solicitud(es) disponible(s)
            </p>
          </div>
        }
      </div>
    </div>

    <!-- Modal de Confirmación -->
    @if (isModalOpen) {
      <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style="z-index: 10000">
        <div class="absolute inset-0 bg-[#0b1120]/80 backdrop-blur-md transition-opacity" (click)="closeModal()"></div>
        
        <div class="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-full" style="z-index: 10001">
          <!-- Modal Map -->
          @if (selectedIncidente?.coordenadagps) {
            <div id="modal-map" class="h-[200px] w-full brightness-90 contrast-125 saturate-50 shrink-0 border-b border-white/10"></div>
          }
          
          <div class="p-6 md:p-8 overflow-y-auto">
            <h2 class="text-2xl font-extrabold text-white mb-2 drop-shadow">Confirmar Asistencia</h2>
            <p class="text-blue-100/70 text-sm mb-6 leading-relaxed">
              ¿Deseas ofrecer tu servicio para el <strong>Incidente #{{ selectedIncidente?.id }}</strong>? 
              Envía tu propuesta de precio y tiempo estimado al conductor.
            </p>
            
            @if (selectedIncidente?.coordenadagps) {
              <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-400 shrink-0 drop-shadow">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span class="text-sm text-blue-300 font-mono tracking-wider">{{ selectedIncidente?.coordenadagps }}</span>
              </div>
            }

            <div class="space-y-5 mb-8">
              <div>
                <label class="block text-xs font-bold text-blue-200/50 uppercase tracking-widest mb-2">Monto Oferta (BOB)</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                  <input 
                    type="number" 
                    [(ngModel)]="montoOferta" 
                    placeholder="0.00"
                    class="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all font-bold text-white placeholder-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  >
                </div>
              </div>
              
              <div>
                <label class="block text-xs font-bold text-blue-200/50 uppercase tracking-widest mb-2">Tiempo Estimado</label>
                <input 
                  type="text" 
                  [(ngModel)]="tiempoEstimadoOferta" 
                  placeholder="Ej: 30 minutos, 2 horas..."
                  class="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all font-semibold text-white placeholder-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                >
              </div>
              
              <div>
                <label class="block text-xs font-bold text-blue-200/50 uppercase tracking-widest mb-2">Mensaje Adicional</label>
                <textarea 
                  [(ngModel)]="mensajeOferta" 
                  placeholder="Ej: Incluye remolque y revisión con escáner..."
                  rows="3"
                  class="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm text-white placeholder-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] resize-none"
                ></textarea>
              </div>
            </div>

            @if (modalError) {
              <div class="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ modalError }}
              </div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
              <button type="button" (click)="closeModal()" class="w-full sm:w-auto px-6 py-3 rounded-xl text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-medium text-sm">Cancelar</button>
              <button 
                (click)="confirmarAsignacion()" 
                [disabled]="isAssigning || yaCotizado(selectedIncidente!)"
                [class.from-emerald-600]="yaCotizado(selectedIncidente!)"
                [class.to-teal-500]="yaCotizado(selectedIncidente!)"
                class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                @if (isAssigning) { 
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando... 
                } @else { 
                  Confirmar Servicio 
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Lightbox -->
    @if (lightboxUrl) {
      <div class="fixed inset-0 flex items-center justify-center p-4 bg-[#0b1120]/90 backdrop-blur-sm" style="z-index: 20000" (click)="closeLightbox()">
        <button class="absolute top-6 right-6 text-white hover:text-red-400 transition-colors drop-shadow" (click)="closeLightbox()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img [src]="lightboxUrl" alt="Evidencia" class="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] object-contain border border-white/10" (click)="$event.stopPropagation()">
      </div>
    }
    
    <!-- Componente de Chat -->
    @if (incidenteChatSeleccionado) {
      <app-chat [incidenteId]="incidenteChatSeleccionado" (close)="cerrarChat()"></app-chat>
    }
  `, 
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SolicitudesPendientesComponent implements OnInit, OnDestroy, AfterViewChecked {
  solicitudes: IncidenteDetalle[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  isAssigning: number | null = null;

  // Modal
  isModalOpen = false;
  selectedIncidente: IncidenteDetalle | null = null;
  modalError: string | null = null;
  tallerId: number | null = null;
  tallerCoords: [number, number] | null = null;
  tallerLoaded = false;
  lightboxUrl: string | null = null;

  // Form cotización
  montoOferta: number | null = null;
  mensajeOferta: string = '';
  tiempoEstimadoOferta: string = '';

  // Chat
  incidenteChatSeleccionado: number | null = null;

  // Maps tracking
  private cardMaps: Map<number, L.Map> = new Map();
  private modalMap: L.Map | null = null;
  private mapsInitialized = false;
  private modalMapInitialized = false;
  private leafletIcon: L.Icon;
  private tallerIcon: L.Icon;

  private incidenteService = inject(IncidenteService);
  private profileService = inject(ProfileService);
  private websocketService = inject(WebsocketService);
  private wsSubscription?: Subscription;

  constructor() {
    // Fix Leaflet's default icon path issue
    this.leafletIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    // Green icon for taller
    this.tallerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  ngOnInit() {
    // Load taller profile first, then solicitudes
    this.loadTallerId(() => {
      this.loadSolicitudes();

      this.websocketService.connect('talleres');
      this.wsSubscription = this.websocketService.messages$.subscribe((msg) => {
        if (msg && (msg.action === 'nuevo_incidente' || msg.action === 'estado_actualizado' || msg.action === 'nueva_solicitud_cotizacion')) {
          this.loadSolicitudes();
        }
      });
    });
  }

  ngAfterViewChecked() {
    // Initialize card maps only after BOTH taller coords and solicitudes are loaded
    if (!this.isLoading && this.tallerLoaded && this.solicitudes.length > 0 && !this.mapsInitialized) {
      this.initCardMaps();
      this.mapsInitialized = true;
    }

    // Initialize modal map when modal opens
    if (this.isModalOpen && this.selectedIncidente?.coordenadagps && !this.modalMapInitialized) {
      setTimeout(() => this.initModalMap(), 50);
      this.modalMapInitialized = true;
    }
  }

  ngOnDestroy() {
    this.destroyAllMaps();
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  private destroyAllMaps() {
    this.cardMaps.forEach(map => map.remove());
    this.cardMaps.clear();
    if (this.modalMap) {
      this.modalMap.remove();
      this.modalMap = null;
    }
  }

  private parseCoords(coordStr: string): [number, number] | null {
    try {
      const parts = coordStr.replace(/\s/g, '').split(',');
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    } catch {}
    return null;
  }

  private initCardMaps() {
    for (const inc of this.solicitudes) {
      if (!inc.coordenadagps) continue;
      if (this.cardMaps.has(inc.id)) continue;

      const containerId = `map-inc-${inc.id}`;
      const container = document.getElementById(containerId);
      if (!container) continue;

      const coords = this.parseCoords(inc.coordenadagps);
      if (!coords) continue;

      const map = L.map(containerId, {
        scrollWheelZoom: false,
        dragging: false,
        zoomControl: false,
        doubleClickZoom: false,
        attributionControl: false
      }).setView(coords, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.marker(coords, { icon: this.leafletIcon }).addTo(map)
        .bindPopup(`<b>Incidente #${inc.id}</b><br>Conductor`);

      // Add taller marker and route if taller coords available
      if (this.tallerCoords) {
        L.marker(this.tallerCoords, { icon: this.tallerIcon }).addTo(map)
          .bindPopup('<b>Tu Taller</b>');
        // Draw dashed line between points
        L.polyline([this.tallerCoords, coords], {
          color: '#3B82F6', weight: 3, opacity: 0.7, dashArray: '8, 8'
        }).addTo(map);
        // Fit bounds to show both markers
        const bounds = L.latLngBounds([this.tallerCoords, coords]);
        map.fitBounds(bounds, { padding: [30, 30] });
        // Fetch driving route from OSRM
        this.fetchRoute(this.tallerCoords, coords, map);
      }

      this.cardMaps.set(inc.id, map);
    }
  }

  private initModalMap() {
    if (!this.selectedIncidente?.coordenadagps) return;

    const container = document.getElementById('modal-map');
    if (!container) return;

    const coords = this.parseCoords(this.selectedIncidente.coordenadagps);
    if (!coords) return;

    this.modalMap = L.map('modal-map', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(coords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.modalMap);

    L.marker(coords, { icon: this.leafletIcon }).addTo(this.modalMap)
      .bindPopup(`<b>Incidente #${this.selectedIncidente.id}</b><br>Conductor`)
      .openPopup();

    // Add taller marker and route
    if (this.tallerCoords) {
      L.marker(this.tallerCoords, { icon: this.tallerIcon }).addTo(this.modalMap)
        .bindPopup('<b>Tu Taller</b>');
      L.polyline([this.tallerCoords, coords], {
        color: '#3B82F6', weight: 3, opacity: 0.5, dashArray: '8, 8'
      }).addTo(this.modalMap);
      const bounds = L.latLngBounds([this.tallerCoords, coords]);
      this.modalMap.fitBounds(bounds, { padding: [40, 40] });
      this.fetchRoute(this.tallerCoords, coords, this.modalMap);
    }
  }

  loadTallerId(callback?: () => void) {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        if (profile.taller) {
          this.tallerId = profile.taller.Id;
          if (profile.taller.Coordenadas) {
            this.tallerCoords = this.parseCoords(profile.taller.Coordenadas);
          }
        }
        this.tallerLoaded = true;
        if (callback) callback();
      },
      error: () => {
        this.tallerLoaded = true;
        if (callback) callback();
      }
    });
  }

  loadSolicitudes() {
    this.isLoading = true;
    this.errorMessage = null;
    // Destroy existing card maps before reload
    this.cardMaps.forEach(map => map.remove());
    this.cardMaps.clear();
    this.mapsInitialized = false;

    this.incidenteService.getSolicitudesPendientes().subscribe({
      next: (data) => {
        // Filtrar aquellos incidentes en los que el taller actual ya haya rechazado la cotización
        if (this.tallerId) {
          this.solicitudes = data.filter(inc => {
            const rejected = inc.cotizaciones?.some(c => c.taller_id === this.tallerId && c.estado === 'Rechazada');
            return !rejected;
          });
        } else {
          this.solicitudes = data;
        }
        
        // Ordenar por número de incidente (ID descendente)
        this.solicitudes.sort((a, b) => b.id - a.id);

        this.isLoading = false;
      },
      error: (e) => {
        this.errorMessage = e.error?.detail || 'Error al cargar solicitudes pendientes';
        this.isLoading = false;
      }
    });
  }

  getDescripcion(inc: IncidenteDetalle): string {
    if (inc.evidencias && inc.evidencias.length > 0) {
      return inc.evidencias[0].descripcion || '';
    }
    return '';
  }

  hasPhotos(inc: IncidenteDetalle): boolean {
    return inc.evidencias?.some(e => !!e.fotos) || false;
  }

  getPhotoUrls(inc: IncidenteDetalle): string[] {
    const urls: string[] = [];
    for (const ev of inc.evidencias || []) {
      if (!ev.fotos) continue;
      const parts = ev.fotos.split('|||').filter(p => p.trim());
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed.startsWith('/uploads')) {
          urls.push(environment.apiUrl + trimmed);
        } else if (trimmed.startsWith('http')) {
          urls.push(trimmed);
        } else if (trimmed.length > 100) {
          // Base64 data
          urls.push('data:image/jpeg;base64,' + trimmed);
        }
      }
    }
    return urls;
  }

  openLightbox(url: string) {
    this.lightboxUrl = url;
  }

  closeLightbox() {
    this.lightboxUrl = null;
  }

  ofrecerCotizacion(inc: IncidenteDetalle) {
    this.selectedIncidente = inc;
    this.modalError = null;
    this.modalMapInitialized = false;
    if (this.modalMap) {
      this.modalMap.remove();
      this.modalMap = null;
    }
    this.isModalOpen = true;
    this.montoOferta = null;
    this.mensajeOferta = '';
    this.tiempoEstimadoOferta = '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedIncidente = null;
    this.modalError = null;
    this.modalMapInitialized = false;
    if (this.modalMap) {
      this.modalMap.remove();
      this.modalMap = null;
    }
  }

  abrirChat(inc: IncidenteDetalle) {
    this.incidenteChatSeleccionado = inc.id;
  }

  cerrarChat() {
    this.incidenteChatSeleccionado = null;
  }

  confirmarAsignacion() {
    if (!this.selectedIncidente || !this.tallerId) {
      this.modalError = 'No se pudo identificar tu taller. Recarga la página.';
      return;
    }

    if (!this.montoOferta || this.montoOferta <= 0) {
      this.modalError = 'Debes ingresar un monto válido para la cotización.';
      return;
    }

    this.isAssigning = this.selectedIncidente.id;
    this.incidenteService.ofrecerCotizacion(this.selectedIncidente.id, this.montoOferta, this.mensajeOferta, this.tiempoEstimadoOferta).subscribe({
      next: () => {
        this.isAssigning = null;
        this.closeModal();
        this.loadSolicitudes(); // Refresh — the offered one will still be there but maybe we want to filter it or show it as offered
        // En este sistema, al ofrecer cotización el incidente sigue en "Reportado" para otros, 
        // pero para este taller ya debería mostrar que envió oferta.
      },
      error: (err) => {
        this.isAssigning = null;
        this.modalError = err.error?.detail || 'Error al enviar la cotización.';
      }
    });
  }

  rechazarCotizacion(inc: IncidenteDetalle) {
    if (confirm('¿Estás seguro de que deseas rechazar esta solicitud de cotización? El incidente desaparecerá de tu lista.')) {
      this.isAssigning = inc.id;
      this.incidenteService.rechazarCotizacion(inc.id).subscribe({
        next: () => {
          this.isAssigning = null;
          this.solicitudes = this.solicitudes.filter(s => s.id !== inc.id);
        },
        error: (err) => {
          this.isAssigning = null;
          this.errorMessage = 'Error al rechazar cotización: ' + (err.error?.detail || err.message);
        }
      });
    }
  }

  yaCotizado(inc: IncidenteDetalle): boolean {
    if (!inc.cotizaciones || !this.tallerId) return false;
    return inc.cotizaciones.some(c => c.taller_id === this.tallerId && c.estado !== 'Rechazada' && c.estado !== 'Solicitada');
  }

  esCotizacionSolicitadaDirecta(inc: IncidenteDetalle): boolean {
    if (!inc.cotizaciones || !this.tallerId) return false;
    return inc.cotizaciones.some(c => c.taller_id === this.tallerId && c.estado === 'Solicitada');
  }

  private fetchRoute(from: [number, number], to: [number, number], map: L.Map) {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]] as [number, number]
          );
          L.polyline(coords, {
            color: '#2563EB', weight: 4, opacity: 0.85
          }).addTo(map);
        }
      })
      .catch(() => { /* OSRM unavailable, keep dashed line */ });
  }
}
