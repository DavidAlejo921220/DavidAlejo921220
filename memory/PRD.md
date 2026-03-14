# GruaApp - PRD (Product Requirements Document)

## Descripción del Producto
GruaApp es un marketplace de servicios de grúa on-demand para Colombia, similar a InDriver. Permite a clientes solicitar servicios de grúa, conductores ofertar precios, y administradores gestionar la plataforma.

## Cambios Implementados (14 Mar 2026 - Informe de Pruebas)

### ✅ Correcciones Realizadas

#### 1. Módulo Conductor
- ✅ **Visualización de servicios**: Página "Mis Servicios" completamente rediseñada con lista y detalle
- ✅ **Detalle del servicio**: Muestra información completa (cliente, direcciones, mapa, precio)
- ✅ **Cambio de estado**: Botones para cambiar estado (Aceptado → En camino → Recogido → En tránsito → Completado)
- ✅ **Filtros funcionales**: Todos, Activos, Completados
- ✅ **Moneda COP**: Saldo, ofertas y ganancias en pesos colombianos

#### 2. Módulo Cliente
- ✅ **Solicitud de servicio en COP**: El formulario ahora solicita precio en COP
- ✅ **Mapa del conductor**: Cuando se acepta un servicio, se muestra el mapa con la ubicación del conductor
- ✅ **Filtros funcionales**: Click en Activos/Completados filtra correctamente la lista
- ✅ **Ver detalle**: Botón "Ver Detalle" en cada servicio con información completa

#### 3. Conversión de Moneda a COP ✅
- Todos los valores monetarios se muestran en COP
- Formato: $50.000 (punto como separador de miles)
- Aplicado en: Dashboard admin, ofertas, ganancias, saldo, servicios

#### 4. Módulo de Recarga de Cuenta ✅
- **Botón "Recargar Saldo"** visible cuando el saldo es bajo o $0
- Link de Nequi: `nequi://pay?phone=3508476536&amount=20000`
- **Código QR** de Nequi incluido
- **IMPORTANTE**: Se indica que deben incluir la PLACA en el mensaje

#### 5. Módulo de Validación de Conductores ✅
- Nueva página `/admin/drivers-validation`
- **Tabs**: Pendientes de aprobación / Aprobados
- **Visualización de documentos**:
  - Foto de la grúa (con placa visible)
  - Tarjeta de propiedad
  - Cédula del propietario
  - Seguro de Responsabilidad Civil (RCE)
- **Acciones**: Aprobar / Rechazar conductor
- Conductores nuevos quedan en estado "Pendiente de aprobación"

#### 6. Documentos Requeridos para Conductores ✅
- **Tarjeta de propiedad** del vehículo (obligatoria)
- **Cédula del propietario** del vehículo (obligatoria)
- **Seguro de Responsabilidad Civil Extracontractual (RCE)** (obligatorio)
- Todos asociados al número de placa

#### 7. Términos de Exención de Responsabilidad ✅
- **Popup de términos** al primer uso del cliente
- Texto completo de exención de responsabilidad
- Botón "Acepto los Términos" para continuar

#### 8. Botón de Ayuda WhatsApp ✅
- Número: **+573025159176**
- Presente en TODAS las pantallas como botón flotante verde
- Mensaje predefinido según contexto

## Arquitectura Técnica

### Stack Tecnológico
- **Backend**: FastAPI (Python) con arquitectura modular de routers
- **Frontend**: React con TailwindCSS y Shadcn/UI
- **Base de Datos**: MongoDB (Motor - async driver)
- **WebSockets**: Socket.IO para tiempo real

### Endpoints Nuevos
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/drivers/pending` | GET | Lista conductores pendientes |
| `/api/admin/drivers/approved` | GET | Lista conductores aprobados |
| `/api/admin/drivers/{id}/approve` | POST | Aprobar conductor |
| `/api/admin/drivers/{id}/reject` | POST | Rechazar conductor |
| `/api/auth/users/{id}` | GET | Obtener info de usuario |

## Flujos de Usuario

### Conductor Nuevo
1. Registro (email, contraseña, teléfono) → Auto-verificado
2. Redirigido a `/driver/registration` para completar:
   - Datos del vehículo (tipo, marca, modelo)
   - **PLACA OBLIGATORIA**
   - **Foto de grúa con PLACA VISIBLE** (obligatoria)
   - **Tarjeta de propiedad** (obligatoria)
   - **Cédula del propietario** (obligatoria)
   - **Seguro RCE** (obligatorio)
3. Queda en estado **"Pendiente de aprobación"**
4. Admin revisa documentos y aprueba/rechaza
5. Una vez aprobado, puede empezar a trabajar

### Cliente
1. Acepta **Términos de exención** al primer uso
2. Registro → Dashboard
3. Crear servicio:
   - Datos del vehículo
   - **Punto de RECOGIDA** (mapa + dirección)
   - **Punto de DESTINO** (mapa + dirección)
   - Todos los valores en **COP**
4. Recibe ofertas de conductores
5. Al aceptar, puede ver **ubicación del conductor en mapa**

### Administrador
1. Login → Dashboard con métricas en **COP**
2. **Validar Conductores**:
   - Ver solicitudes pendientes
   - Revisar documentos (foto grúa, tarjeta, cédula, seguro)
   - Aprobar o rechazar
3. Gestión de billeteras con recarga manual

## Credenciales de Prueba

- **Admin**: admin@gruaapp.com / Admin2026!
- **Cliente test**: testcliente@test.com / test1234
- **Conductor**: transportesunir1@gmail.com / BHS369

## Recarga de Saldo

### Datos de Nequi
- **Nombre**: DAVID GAMBA
- **Número**: 3508476536
- **Código QR**: Disponible en el modal de recarga
- **IMPORTANTE**: Incluir la PLACA del vehículo en el mensaje

## Backlog

### Completado ✅
- [x] Moneda en COP
- [x] Módulo de recarga con Nequi y QR
- [x] Validación de conductores
- [x] Documentos obligatorios (tarjeta, cédula, seguro)
- [x] Términos de exención
- [x] Botón de ayuda WhatsApp
- [x] Filtros funcionales en dashboards
- [x] Cambio de estado de servicios
- [x] Mapa de ubicación del conductor

### Pendiente
- [ ] Notificaciones por email para conductores
- [ ] App móvil Android (React Native)
- [ ] Sistema de precios sugeridos automáticos

## Moneda y Localización
- **Moneda**: COP (Pesos Colombianos)
- **Formato**: $50.000 (punto como separador de miles)
- **Idioma**: Español
- **País**: Colombia
