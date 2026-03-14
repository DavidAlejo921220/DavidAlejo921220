# GruaApp - PRD (Product Requirements Document)

## Descripción del Producto
GruaApp es un marketplace de servicios de grúa on-demand para Colombia, similar a InDriver. Permite a clientes solicitar servicios de grúa, conductores ofertar precios, y administradores gestionar la plataforma.

## Cambios Recientes (14 Mar 2026)

### ✅ Cambios Implementados
1. **Sin OTP** - Registro sin verificación de email (usuarios auto-verificados)
2. **Conductores**: Registro de vehículo OBLIGATORIO (placa + foto de grúa con placa visible + tarjeta de propiedad)
3. **Bloqueo por saldo $0** - Conductores con saldo 0 no pueden ver ni aceptar servicios
4. **Bloqueo sin registro** - Conductores sin registro completo no pueden operar
5. **Botón de Ayuda WhatsApp** (+573025159176) en todas las pantallas
6. **Formulario de Servicio Mejorado**:
   - Punto de RECOGIDA obligatorio (marcador verde en mapa)
   - Punto de DESTINO obligatorio (marcador rojo en mapa)
   - Direcciones de texto obligatorias
   - Instrucciones claras de cómo funciona
7. **Campanita de Notificaciones** en todos los dashboards
8. **Moneda COP** - Formato de pesos colombianos

## Arquitectura Técnica

### Stack Tecnológico
- **Backend**: FastAPI (Python) con arquitectura modular de routers
- **Frontend**: React con TailwindCSS y Shadcn/UI
- **Base de Datos**: MongoDB (Motor - async driver)
- **WebSockets**: Socket.IO para tiempo real
- **Email**: Resend API (configurado pero OTP deshabilitado)
- **Imágenes**: Cloudinary para almacenamiento

### Estructura del Backend
```
/app/backend/
├── main.py              # Punto de entrada FastAPI
├── server.py            # Wrapper para uvicorn
├── config.py            # Configuración centralizada
├── database.py          # Conexión MongoDB
├── auth.py              # Utilidades JWT
├── websocket_manager.py # Gestor Socket.IO
├── routers/
│   ├── auth_router.py     # /api/auth/*
│   ├── drivers_router.py  # /api/drivers/*
│   ├── services_router.py # /api/services/*
│   ├── offers_router.py   # /api/offers/*
│   ├── chat_router.py     # /api/chat/*
│   ├── ratings_router.py  # /api/ratings/*
│   └── admin_router.py    # /api/admin/*
└── tests/
```

## Flujos de Usuario

### Conductor Nuevo
1. Registro (email, contraseña, teléfono) → Auto-verificado
2. Redirigido a `/driver/registration` para completar:
   - Datos del vehículo (tipo, marca, modelo)
   - **PLACA OBLIGATORIA**
   - **Foto de grúa con PLACA VISIBLE (obligatoria)**
   - Tarjeta de propiedad (obligatoria)
3. Recibe bono inicial de $5,000 COP
4. Puede activarse si tiene saldo > 0

### Cliente
1. Registro → Auto-verificado → Dashboard
2. Crear servicio:
   - Datos del vehículo
   - **Punto de RECOGIDA** (mapa + dirección)
   - **Punto de DESTINO** (mapa + dirección)
3. Recibe ofertas de conductores
4. Acepta/rechaza ofertas

### Administrador
1. Login → Dashboard con métricas
2. Gestión de billeteras:
   - Ver lista de conductores
   - **Clic en PLACA para editar saldo**
   - Recargar saldo manualmente

## Restricciones de Negocio

### Conductores
- **Saldo 0** = No puede ver servicios, no puede activarse
- **Sin registro de vehículo** = No puede operar
- **Comisión 5%** se descuenta automáticamente al aceptar oferta

### Contacto de Ayuda
- WhatsApp: **+573025159176**
- Presente en todas las pantallas como botón flotante verde

## Conductores Registrados

| Nombre | Email | Placa | Saldo |
|--------|-------|-------|-------|
| Giovanny Beltran | transportesunir1@gmail.com | BHS369 | $50,000 COP |

## Credenciales de Prueba

- **Admin**: admin@gruaapp.com / Admin2026!
- **Cliente test**: testcliente@test.com / test1234

## Backlog

### P1 - Alta Prioridad
- [ ] Agregar sonidos a notificaciones
- [ ] Mejorar tracking en tiempo real del conductor

### P2 - Media Prioridad
- [ ] App móvil Android (React Native)
- [ ] Sistema de precios sugeridos automáticos

### P3 - Baja Prioridad
- [ ] Asignación automática estilo Uber
- [ ] Migración a PostgreSQL (opcional)

## Moneda y Localización
- **Moneda**: COP (Pesos Colombianos)
- **Idioma**: Español
- **País**: Colombia
