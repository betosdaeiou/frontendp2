import os

html_path = 'src/app/features/mantenimientos/mantenimientos.component.html'
ts_path = 'src/app/features/mantenimientos/mantenimientos.component.ts'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hardcoded states in HTML
replacements_html = {
    "m.estado === 'Asignado'": "m.estado === 'taller asignado'",
    "m.estado === 'En Camino'": "m.estado === 'en camino'",
    "m.estado === 'Resuelto'": "m.estado === 'finalizado'",
    "m.estado !== 'Resuelto'": "m.estado !== 'finalizado'",
    "m.estado !== 'Pagado'": "m.estado !== 'finalizado'", # Or ignore Pagado
    "m.estado === 'Pagado'": "m.estado === 'finalizado'",
    "cambiarEstado(m.id, 'En Camino')": "cambiarEstado(m.id, 'en camino')",
    "cambiarEstado(m.id, 'Resuelto')": "cambiarEstado(m.id, 'finalizado')"
}

for k, v in replacements_html.items():
    html = html.replace(k, v)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

with open(ts_path, 'r', encoding='utf-8') as f:
    ts = f.read()

# In TS, it checks for 'estado_actualizado' or 'taller_asignado' or 'cotizacion_aceptada'
# We don't really have to change the action names from backend, but let's check
with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts)

print("HTML states updated.")
