import os

ts_path = 'src/app/features/mantenimientos/mantenimientos.component.ts'

with open(ts_path, 'r', encoding='utf-8') as f:
    ts = f.read()

# Add mecanicoMarker to class properties
ts = ts.replace(
    "private map: L.Map | null = null;",
    "private map: L.Map | null = null;\n  private mecanicoMarker: L.Marker | null = null;"
)

# Update wsSubscription
old_ws = """    this.wsSubscription = this.websocketService.messages$.subscribe((msg) => {
      if (msg && (msg.action === 'estado_actualizado' || msg.action === 'taller_asignado' || msg.action === 'cotizacion_aceptada')) {
        this.cargarMantenimientos();
      }
    });"""

new_ws = """    this.wsSubscription = this.websocketService.messages$.subscribe((msg) => {
      if (msg && (msg.action === 'estado_actualizado' || msg.action === 'taller_asignado' || msg.action === 'cotizacion_aceptada')) {
        this.cargarMantenimientos();
      } else if (msg && msg.action === 'telemetria') {
        if (this.isDetalleModalOpen && this.selectedIncidente?.id === msg.incidente_id && this.map) {
          if (this.mecanicoMarker) {
            this.mecanicoMarker.setLatLng([msg.lat, msg.lng]);
          } else {
            const greenIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            this.mecanicoMarker = L.marker([msg.lat, msg.lng], {icon: greenIcon}).addTo(this.map)
              .bindPopup('<b>Técnico en camino</b>');
          }
        }
      }
    });"""

ts = ts.replace(old_ws, new_ws)

# Clear marker on close
old_close = """  cerrarModalDetalles(): void {
    this.isDetalleModalOpen = false;
    this.selectedIncidente = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }"""

new_close = """  cerrarModalDetalles(): void {
    this.isDetalleModalOpen = false;
    this.selectedIncidente = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.mecanicoMarker = null;
  }"""

ts = ts.replace(old_close, new_close)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts)

print("TS marker logic added.")
