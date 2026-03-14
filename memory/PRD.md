# GruaApp - PRD (Product Requirements Document)

## Descripción del Producto
GruaApp es un marketplace de servicios de grúa on-demand para Colombia, similar a InDriver. Permite a clientes solicitar servicios de grúa, conductores ofertar precios, y administradores gestionar la plataforma.

## Arquitectura Técnica

### Stack Tecnológico
- **Backend**: FastAPI (Python) con arquitectura modular de routers
- **Frontend**: React con TailwindCSS y Shadcn/UI
- **Base de Datos**: MongoDB (Motor - async driver)
- **WebSockets**: Socket.IO para tiempo real
- **Email**: Resend API para OTP
- **Imágenes**: Cloudinary para almacenamiento

### Estructura del Backend (Refactorizado)
```
/app/backend/
├── main.py              # Punto de entrada FastAPI
├── server.py            # Wrapper para uvicorn
├── config.py            # Configuración centralizada
├── database.py          # Conexión MongoDB
├── auth.py              # Utilidades JWT
├── websocket_manager.py # Gestor Socket.IO
├── models.py            # Modelos Pydantic
├── utils.py             # Utilidades (OTP, distancias)
├── cloudinary_helper.py # Upload de imágenes
├── routers/
│   ├── auth_router.py     # /api/auth/*
│   ├── drivers_router.py  # /api/drivers/*
│   ├── services_router.py # /api/services/*
│   ├── offers_router.py   # /api/offers/*
│   ├── chat_router.py     # /api/chat/*
│   ├── ratings_router.py  # /api/ratings/*
│   └── admin_router.py    # /api/admin/*
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_admin.py
    └── test_services.py
```

## Características Implementadas ✅

### Sistema de Autenticación
- ✅ Registro de usuarios (cliente/conductor/admin)
- ✅ Login con JWT
- ✅ Verificación OTP por email (Resend)
- ✅ Reenvío de OTP

### Panel de Cliente
- ✅ Dashboard personalizado
- ✅ Creación de solicitudes de servicio
- ✅ Mapa interactivo para ubicaciones
- ✅ Vista de ofertas de conductores
- ✅ Aceptar/rechazar ofertas
- ✅ Seguimiento en tiempo real
- ✅ Chat con conductor
- ✅ Historial de servicios
- ✅ **Campanita de notificaciones** con eventos en tiempo real

### Panel de Conductor
- ✅ Registro con documentos (Cloudinary)
- ✅ Toggle de disponibilidad
- ✅ Lista de servicios disponibles (ordenados por proximidad)
- ✅ Crear ofertas de precio
- ✅ Gestión de servicios activos
- ✅ Sistema de billetera
- ✅ Historial de transacciones
- ✅ Notificaciones de saldo bajo
- ✅ **Campanita de notificaciones** con alertas de:
  - Nuevos servicios disponibles
  - Ofertas aceptadas/rechazadas
  - Actualizaciones de saldo
  - Mensajes de chat

### Panel de Administración
- ✅ Dashboard con métricas
- ✅ Gestión de usuarios (bloquear/desbloquear)
- ✅ **Gestión de billeteras mejorada**:
  - Ver lista de conductores con saldos
  - **Clic en PLACA para editar saldo directamente**
  - Dos modos: "Añadir Monto" y "Establecer Saldo"
  - Visualización de diferencia (+/-) en tiempo real
- ✅ Recarga manual de saldos
- ✅ Configuración de comisiones
- ✅ **Campanita de notificaciones**

### Sistema de Billetera
- ✅ Saldo inicial de $5,000 COP para nuevos conductores
- ✅ Deducción automática de comisión (5%) al aceptar oferta
- ✅ Alertas de saldo bajo (<$1,000 COP)
- ✅ **Edición directa de saldo por admin (clic en placa)**
- ✅ Historial de transacciones con notas

### Sistema de Notificaciones (NUEVO)
- ✅ **Campanita de notificaciones** en todos los dashboards
- ✅ Badge con contador de notificaciones no leídas
- ✅ Tipos de notificaciones:
  - 🚗 Nuevos servicios (para conductores)
  - 💰 Nuevas ofertas (para clientes)
  - ✅ Ofertas aceptadas
  - ❌ Ofertas rechazadas
  - 💵 Recargas de saldo
  - 💸 Comisiones descontadas
  - ⚠️ Alertas de saldo bajo
  - 🚛 Conductor cercano
  - 💬 Nuevos mensajes de chat
- ✅ Marcar como leídas individual o todas
- ✅ Borrar notificaciones
- ✅ Persistencia en localStorage

### Tiempo Real (WebSockets)
- ✅ Notificaciones de nuevos servicios
- ✅ Actualización de ubicación del conductor
- ✅ Alertas de conductor cercano
- ✅ Chat en tiempo real
- ✅ Actualizaciones de estado de servicio
- ✅ **Notificaciones push integradas en la app**

## Conductores Registrados (Prueba)

| Nombre | Email | Placa | Saldo |
|--------|-------|-------|-------|
| Giovanny Beltran | transportesunir1@gmail.com | BHS369 | $50,000 COP |

## Credenciales de Prueba

- **Admin**: admin@gruaapp.com / Admin2026!

## Estado de Testing (14 Mar 2026)

- **Backend**: 18/18 tests pasando (100%)
- **Frontend**: 25/25 tests pasando (100%)
- **Archivos de test**: `/app/backend/tests/`, `/app/tests/e2e/`

## Próximos Pasos (Backlog)

### P1 - Alta Prioridad
- [ ] Mejorar experiencia de tracking en tiempo real
- [ ] Agregar sonido a notificaciones

### P2 - Media Prioridad
- [ ] App móvil Android (React Native)
- [ ] Sistema de precios sugeridos automáticos
- [ ] Historial completo de servicios con filtros

### P3 - Baja Prioridad
- [ ] Asignación automática estilo Uber
- [ ] Migración a PostgreSQL (opcional)
- [ ] Panel de reportes avanzados

## Moneda y Localización
- Moneda: COP (Pesos Colombianos)
- Idioma: Español
- País: Colombia
