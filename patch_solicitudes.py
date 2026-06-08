import os

path = 'src/app/features/solicitudes-pendientes/solicitudes-pendientes.component.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add property
old_prop = """  montoOferta: number | null = null;
  mensajeOferta: string = '';"""
new_prop = """  montoOferta: number | null = null;
  mensajeOferta: string = '';
  tiempoEstimadoOferta: string = '';"""
content = content.replace(old_prop, new_prop)

# Update ofrecerCotizacion to clear the new prop
old_clear = """    this.montoOferta = null;
    this.mensajeOferta = '';
  }"""
new_clear = """    this.montoOferta = null;
    this.mensajeOferta = '';
    this.tiempoEstimadoOferta = '';
  }"""
content = content.replace(old_clear, new_clear)

# Update confirmarAsignacion to send the new prop
old_send = """    this.incidenteService.ofrecerCotizacion(this.selectedIncidente.id, this.montoOferta, this.mensajeOferta).subscribe({"""
new_send = """    this.incidenteService.ofrecerCotizacion(this.selectedIncidente.id, this.montoOferta, this.mensajeOferta, this.tiempoEstimadoOferta).subscribe({"""
content = content.replace(old_send, new_send)

# Add HTML input
old_html = """              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mensaje o Detalle (Opcional)</label>"""

new_html = """              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tiempo Estimado (Opcional)</label>
                <input 
                  type="text" 
                  [(ngModel)]="tiempoEstimadoOferta" 
                  placeholder="Ej: 2 horas, 1 día..."
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold text-gray-700 mb-4"
                >
              </div>
              
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mensaje o Detalle (Opcional)</label>"""
content = content.replace(old_html, new_html)


with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("solicitudes-pendientes.component.ts patched")
