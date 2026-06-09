# 🌐 Frontend - Plataforma de Emergencias Vehiculares

Aplicación web Progressive Web App (PWA) para gestión de emergencias vehiculares con funcionalidad offline, comunicación en tiempo real y análisis inteligente.

## 🏗️ Arquitectura

- **Framework**: Angular 21.2.9
- **UI**: Tailwind CSS 4.1.12
- **Maps**: Leaflet
- **PWA**: Service Worker nativo de Angular
- **Storage**: IndexedDB (via idb)
- **Server**: Nginx (producción)

## 📦 Estructura del Proyecto

```
frontendp2/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios (API, Auth, etc.)
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── models/          # Interfaces y tipos
│   ├── environments/        # Configuración por ambiente
│   └── assets/              # Recursos estáticos
├── public/                  # Archivos públicos
├── dist/                    # Build de producción
├── Dockerfile               # Multi-stage build con Nginx
├── angular.json             # Configuración Angular
├── tailwind.config.js       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
└── ngsw-config.json         # Configuración Service Worker

```

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Requisitos Previos
- Node.js 24+ (recomendado usar nvm)
- npm 11.9.0+
- Backend corriendo en http://localhost:8000

### 2. Instalación

```bash
# Clonar repositorio
cd frontendp2

# Instalar dependencias
npm install

# Configurar URL del backend
# Editar src/app/services/*.service.ts si es necesario
```

### 3. Ejecutar

```bash
# Desarrollo
npm start
# Visitar: http://localhost:8080

# Build de producción
npm run build

# Watch mode
npm run watch
```

### 4. Docker (Alternativa)

```bash
# Build
docker build -t frontend .

# Run
docker run -p 80:80 frontend
# Visitar: http://localhost
```

## 🎨 Características

### ✨ PWA (Progressive Web App)
- ✅ Instalable en dispositivos móviles y desktop
- ✅ Funciona offline después de la primera carga
- ✅ Service Worker para cache inteligente
- ✅ Notificaciones push (si backend configurado)

### 🗺️ Mapas Interactivos
- Visualización de ubicaciones de incidentes
- Tracking en tiempo real de mecánicos
- Leaflet + OpenStreetMap

### 💾 Almacenamiento Offline
- IndexedDB para datos locales
- Sincronización automática al recuperar conexión
- Queue de cambios pendientes

### 🔐 Autenticación
- Login con JWT
- Guards para rutas protegidas
- Refresh token automático
- Roles y permisos

### 📱 Responsive Design
- Mobile-first con Tailwind CSS
- Adaptado para tablets y desktop
- Menú hamburguesa en móvil

## 📚 Módulos Principales

### Auth
- Login/Registro
- Recuperación de contraseña
- Gestión de sesión

### Dashboard
- Vista general de incidentes
- Estadísticas en tiempo real
- Mapa de emergencias activas

### Incidentes
- Crear nuevo incidente
- Listar incidentes (filtros)
- Detalle de incidente
- Chat en tiempo real
- Historial de cambios

### Perfil
- Datos del usuario
- Vehículos registrados
- Configuración de cuenta

### Mecánicos (Admin)
- Gestión de mecánicos
- Asignación de incidentes
- Historial de servicios

### Analytics (Admin)
- Reportes y gráficos
- Métricas de rendimiento
- Exportación de datos

## 🔧 Configuración

### API URL
Actualizar en los servicios según el ambiente:

```typescript
// src/app/services/api.service.ts
private apiUrl = 'https://tu-backend.coolify.app';
```

O usar `environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.coolify.app'
};
```

### Service Worker
Configuración en `ngsw-config.json`:
- Cache de assets estáticos
- Cache de API responses
- Estrategias de cache

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (si configurado)
npm run e2e
```

## 🐳 Despliegue en Coolify

Ver guía completa: [COOLIFY_DEPLOY.md](./COOLIFY_DEPLOY.md)

### Resumen:
1. Actualizar URL del backend en el código
2. Push a repositorio
3. Coolify detecta Dockerfile y hace build automático
4. Nginx sirve la app en puerto 80

### Build Multi-Stage
El Dockerfile usa dos etapas:
1. **Build**: Compila Angular con npm
2. **Serve**: Nginx Alpine sirve archivos estáticos

## 📱 Uso como PWA

### Instalar en Móvil
1. Abrir en navegador móvil
2. Menú → "Agregar a pantalla de inicio"
3. Usar como app nativa

### Instalar en Desktop
1. Abrir en Chrome/Edge
2. Barra de direcciones → Ícono de instalación
3. Click "Instalar"

## 🔒 Seguridad

- ✅ HTTPS en producción (Coolify)
- ✅ Sanitización de inputs
- ✅ HTTP-only cookies (si implementado)
- ✅ CORS configurado en backend
- ✅ Content Security Policy (CSP)

## 📊 Tecnologías

- **Angular**: Framework SPA
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Utility-first CSS
- **Leaflet**: Mapas interactivos
- **RxJS**: Programación reactiva
- **IndexedDB**: Base de datos local
- **Service Worker**: PWA capabilities
- **Nginx**: Servidor web (prod)

## 🎯 Scripts Disponibles

```bash
npm start          # Dev server (localhost:8080)
npm run build      # Build producción
npm run watch      # Build en watch mode
npm test           # Run tests
```

## 🌐 Navegadores Soportados

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📝 Licencia

Este proyecto es privado y de uso académico.

## 👥 Autores

Proyecto desarrollado como parte del Segundo Parcial de Sistemas de Información 2.

## 🆘 Soporte

Para problemas o preguntas, abre un issue en el repositorio.

---

**Estado**: ✅ Listo para producción
**Última actualización**: Junio 2026
