import os

path = 'src/app/app.config.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

imports_old = "import { authInterceptor } from './core/interceptors/auth.interceptor';"
imports_new = "import { authInterceptor } from './core/interceptors/auth.interceptor';\nimport { offlineInterceptor } from './core/interceptors/offline.interceptor';"
content = content.replace(imports_old, imports_new)

provider_old = "provideHttpClient(withInterceptors([authInterceptor])),"
provider_new = "provideHttpClient(withInterceptors([authInterceptor, offlineInterceptor])),"
content = content.replace(provider_old, provider_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("app.config.ts patched")
