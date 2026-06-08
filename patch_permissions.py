import os

path = 'src/app/features/dashboard/dashboard.component.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Guardar Bitacora link
old_bitacora = """      <a routerLink="/dashboard/bitacora" routerLinkActive="active" class="s-link">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Bitacora
      </a>"""

new_bitacora = """      @if (hasPermiso('Ver Bitacora')) {
        <a routerLink="/dashboard/bitacora" routerLinkActive="active" class="s-link">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Bitacora
        </a>
      }"""

content = content.replace(old_bitacora, new_bitacora)

# 2. Fix KPI Cards permission wrapper
# Actualmente están dentro de un @if (hasPermiso('Ver Operaciones')) que fue parcheado antes.
# Tenemos que encontrar el bloque de KPI cards en el main content
old_kpi_start = """        @if (hasPermiso('Ver Operaciones')) {
          <!-- KPI CARDS -->"""

new_kpi_start = """        @if (hasPermiso('Ver Analytics')) {
          <!-- KPI CARDS -->"""

content = content.replace(old_kpi_start, new_kpi_start)

# También arreglar el ts file, porque loadKpis() asume que role Taller lo carga siempre
path_ts = 'src/app/features/dashboard/dashboard.component.ts'
with open(path_ts, 'r', encoding='utf-8') as f_ts:
    ts_content = f_ts.read()

old_ts_init = """  ngOnInit() {
    if (this.role() === 'Taller' || this.role() === 'Admin') {
      this.loadKpis();
    }
  }"""

new_ts_init = """  ngOnInit() {
    if (this.hasPermiso('Ver Analytics')) {
      this.loadKpis();
    }
  }"""

ts_content = ts_content.replace(old_ts_init, new_ts_init)

with open(path_ts, 'w', encoding='utf-8') as f_ts:
    f_ts.write(ts_content)


with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Permissions patched in frontend")
