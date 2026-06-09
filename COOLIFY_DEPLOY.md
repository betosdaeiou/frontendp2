# 🚀 Guía de Despliegue en Coolify - Frontend

## 📋 Pre-requisitos

1. Backend ya desplegado en Coolify (ver backendp2/COOLIFY_DEPLOY.md)
2. URL del backend funcionando
3. Cuenta en Coolify configurada

## 🔧 Configuración en Coolify

### 1. Desplegar Frontend

1. En Coolify, ve a **Applications** → **+ New Application**
2. Selecciona **Git Repository**
3. Configura:
   - **Repository**: Tu repo de GitHub/GitLab
   - **Branch**: `main` o `master`
   - **Build Pack**: Docker (detectará automáticamente el Dockerfile)
   - **Base Directory**: `/frontendp2` (si es monorepo)
   - **Port**: `80`

### 2. Variables de Entorno (Opcional)

Si tu aplicación usa variables de entorno en tiempo de build:

```bash
# Normalmente NO es necesario, ya que Angular usa proxy o URLs hardcodeadas
# Pero si lo necesitas:
API_URL=https://tu-backend.coolify.app
```

**IMPORTANTE**: Si la URL del backend está hardcodeada en el código, actualízala antes del despliegue.

### 3. Verificar Configuración del Backend en el Código

Antes de desplegar, verifica que la URL del backend esté configurada correctamente:

**Ubicación típica**: `src/app/services/*.service.ts`

```typescript
// Ejemplo:
private apiUrl = 'https://tu-backend.coolify.app/api';
```

O en archivo de configuración (si existe):
```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.coolify.app'
};
```

## 📦 Proceso de Build (Automático)

El Dockerfile realiza un **build multi-stage**:

1. **Stage 1 - Build**: 
   - Instala dependencias (npm install)
   - Compila la aplicación Angular en modo producción
   - Genera archivos estáticos optimizados

2. **Stage 2 - Serve**: 
   - Usa Nginx Alpine (ligero)
   - Copia los archivos compilados
   - Configura rutas SPA (Single Page Application)
   - Habilita cache para assets estáticos

## 🎯 Proceso de Despliegue

1. **Push al repositorio**: Coolify detecta cambios automáticamente
2. **Build automático**: 
   - `npm install` (instala dependencias)
   - `npm run build -- --configuration=production` (compila Angular)
3. **Deploy**: Nginx sirve la aplicación en puerto 80
4. **Verificación**: Visita tu URL de Coolify

## ✅ Verificación Post-Despliegue

### 1. Acceso a la Aplicación
Abre: `https://tu-frontend.coolify.app`

### 2. Verificar Conexión con Backend
1. Abre DevTools (F12) → Network
2. Intenta hacer login o cualquier acción
3. Verifica que las peticiones al backend se completen exitosamente

### 3. Verificar Service Worker (PWA)
1. En DevTools → Application → Service Workers
2. Debe aparecer registrado y activo

## 🔧 Configuración Nginx (Ya incluida en Dockerfile)

El Dockerfile ya configura Nginx correctamente para:
- ✅ Rutas SPA (todas las rutas van a index.html)
- ✅ Cache de assets estáticos (1 año)
- ✅ Compresión gzip
- ✅ Headers de seguridad

## 🔒 Seguridad

- ✅ HTTPS automático (Coolify lo provee)
- ✅ Service Worker para modo offline
- ✅ Assets con cache inmutable
- ✅ Sin node_modules en producción (solo archivos compilados)

## 📊 Recursos

- **CPU**: 0.5 vCPU mínimo
- **RAM**: 256 MB mínimo (Nginx es muy ligero)
- **Storage**: ~50 MB (archivos compilados)

## 🐛 Troubleshooting

### La aplicación muestra error 404 en rutas
- Verifica que Nginx esté configurado para SPA (ya incluido en Dockerfile)
- Revisa logs: `try_files $uri $uri/ /index.html;` debe estar presente

### No se conecta al backend
1. Abre DevTools → Console
2. Verifica errores CORS o de red
3. Confirma que la URL del backend sea correcta en el código
4. Verifica que el backend tenga CORS habilitado para tu frontend

### Build falla con "out of memory"
- Aumenta la RAM en Coolify (mínimo 1 GB durante el build)
- O usa `npm ci` en lugar de `npm install`

### Assets no se cargan
- Verifica que la ruta base sea correcta
- En Angular, debe estar configurado: `<base href="/">`

## 🔄 Actualización

1. Haz cambios en tu código
2. Actualiza la URL del backend si es necesario
3. Push a tu rama
4. Coolify reconstruirá y desplegará automáticamente

## 📱 Características PWA

La aplicación es una Progressive Web App (PWA):
- ✅ Service Worker activo
- ✅ Funciona offline (después de la primera carga)
- ✅ Instalable en dispositivos móviles
- ✅ Cache de assets

## 🌐 URLs Importantes

- Frontend: `https://tu-frontend.coolify.app`
- Backend API: `https://tu-backend.coolify.app`
- Backend Docs: `https://tu-backend.coolify.app/docs`

## 🎨 Personalización de Dominio (Opcional)

1. En Coolify → Tu aplicación → **Domains**
2. Agrega tu dominio personalizado: `app.tudominio.com`
3. Configura el DNS:
   - Tipo: `CNAME`
   - Host: `app`
   - Value: Tu URL de Coolify
4. Coolify generará certificado SSL automáticamente

## ✨ Checklist Final

- [ ] Backend desplegado y funcionando
- [ ] URL del backend actualizada en el código
- [ ] Frontend desplegado exitosamente
- [ ] Login funciona correctamente
- [ ] Peticiones al backend se completan
- [ ] PWA instalable en móvil
- [ ] Service Worker activo
- [ ] No hay errores en la consola

## 🎉 ¡Listo!

Tu aplicación Angular está completamente desplegada en Coolify y lista para producción.
