import os

path_ts = 'src/app/app.ts'
with open(path_ts, 'r', encoding='utf-8') as f:
    content_ts = f.read()

imports_old = "import { RouterOutlet } from '@angular/router';"
imports_new = "import { RouterOutlet } from '@angular/router';\nimport { OfflineSyncService } from './core/services/offline-sync.service';\nimport { inject } from '@angular/core';\nimport { CommonModule } from '@angular/common';"
content_ts = content_ts.replace(imports_old, imports_new)

imports_decorator_old = "imports: [RouterOutlet],"
imports_decorator_new = "imports: [RouterOutlet, CommonModule],"
content_ts = content_ts.replace(imports_decorator_old, imports_decorator_new)

class_old = """export class App {
  protected readonly title = signal('emergencia-vehicular');
}"""
class_new = """export class App {
  protected readonly title = signal('emergencia-vehicular');
  public offlineSync = inject(OfflineSyncService);
}"""
content_ts = content_ts.replace(class_old, class_new)

with open(path_ts, 'w', encoding='utf-8') as f:
    f.write(content_ts)


path_html = 'src/app/app.html'
html_content = """
<div *ngIf="!offlineSync.isOnline" class="bg-red-500 text-white text-center py-2 font-semibold">
  Estás sin conexión. Los cambios se guardarán localmente y se sincronizarán cuando regrese el internet.
</div>
<router-outlet></router-outlet>
"""

with open(path_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("app patched")
