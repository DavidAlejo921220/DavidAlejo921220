# GruaApp - PRD (Product Requirements Document)

## Descripción del Producto
GruaApp es un marketplace de servicios de grúa on-demand para Colombia, similar a InDriver. Permite a clientes solicitar servicios de grúa, conductores ofertar precios, y administradores gestionar la plataforma.

## Cambios Implementados (14 Abril 2026)

### ✅ Sistema de Referidos Mejorado
- ✅ Código de referido ahora se puede asociar al momento del **REGISTRO** (cliente o conductor)
- ✅ Campo "¿Te recomendó alguien?" en formulario de registro con validación en tiempo real
- ✅ URL con parámetro `?ref=CODIGO` pre-llena el campo automáticamente
- ✅ En "Solicitar Grúa", si el usuario ya tiene código asociado, aparece **bloqueado y pre-llenado**
- ✅ Si no tiene código asociado, puede agregarlo manualmente en cualquier servicio
- ✅ Backend actualizado para guardar `referido_asociado` en el usuario

## Cambios Implementados (20 Mar 2026)

### ✅ Ajustes Adicionales (Sesión 2)

#### 1. Precio Sugerido Visible para Conductor
- ✅ Conductor ve el precio sugerido por el cliente en tarjeta amarilla destacada
- ✅ Texto: "PRECIO SUGERIDO POR CLIENTE" + monto en grande
- ✅ Nota: "Puedes aceptar este valor o enviar tu propia oferta"

#### 2. Chat Mejorado
- ✅ Diferenciación clara: Mensajes "Enviados" (cyan) vs "Recibidos" (morado)
- ✅ Indicador de lectura (doble check) para mensajes propios
- ✅ Bordes redondeados mejorados para mejor visualización

#### 3. SEO Extendido con H2
- ✅ Palabras clave organizadas en secciones H2 ocultas:
  - "Servicios de Grúa en Colombia"
  - "Características del Servicio" (seguimiento tiempo real, app, pago online, calificación, conductor verificado)
  - "Servicio Confiable" (confiables, segura, certificada, profesional, recomendada)
  - "Grúa para Todo Tipo de Vehículo" (particular, taxi, uber, camión, moto, SUV, camioneta)

### ✅ Funcionalidades Anteriores (Sesión 1)

#### 1. Valor Sugerido por Cliente (Opcional)
- ✅ Campo nuevo en formulario de solicitud de servicio
- ✅ Placeholder: "Valor sugerido en COP (ej: 80000)"
- ✅ Texto explicativo que indica es solo sugerencia
- ✅ No obligatorio

#### 2. Información del Conductor al Cliente
- ✅ Nombre del conductor visible cuando acepta servicio
- ✅ Teléfono clickeable para llamar
- ✅ **PLACA del vehículo** mostrada en modal
- ✅ Marca y modelo de la grúa
- ✅ Botones de Chat y Llamar

#### 3. Sistema de Calificación
- ✅ Modal de calificación con 5 estrellas
- ✅ Campo de comentario opcional
- ✅ Se muestra automáticamente al ver servicio completado
- ✅ Actualiza reputación del conductor

#### 4. Sistema de Propinas
- ✅ Modal de propinas voluntarias post-servicio
- ✅ Montos rápidos: $5.000, $10.000, $20.000, $50.000
- ✅ Monto personalizado disponible
- ✅ Mensaje opcional para el conductor
- ✅ Propina va directo al saldo del conductor

#### 5. Chat Cliente-Conductor
- ✅ WebSocket funcionando en tiempo real
- ✅ Mensajes se envían y reciben correctamente
- ✅ Accesible desde modal de servicio

#### 6. Seguimiento en Tiempo Real
- ✅ Mapa muestra ubicación del conductor en servicios activos
- ✅ Línea de ruta entre conductor y punto de recogida
- ✅ Actualización via WebSocket

## Cambios Implementados (15 Mar 2026)

### ✅ Correcciones de Hoy

#### 1. Login Admin Verificado
- ✅ Login funcionando con credenciales: `admin@gruaapp.com` / `Admin123!`
- ✅ Backend y Frontend verificados

#### 2. Eliminación de Branding Emergent
- ✅ Scripts de Emergent eliminados de `index.html`
- ✅ Badge "Made with Emergent" removido

#### 3. SEO Keywords Agregadas
- ✅ Palabras clave ocultas (sr-only) para Google en Landing page
- ✅ Incluye: grúa de carro, grúa ya, grúa app, grúa de emergencia
- ✅ Todas las localidades de Bogotá (Usaquén, Chapinero, Kennedy, Suba, etc.)

#### 4. Flujo de Registro de Conductor Corregido
- ✅ Registro inicial → muestra mensaje "¡Cuenta creada exitosamente!"
- ✅ Redirige a formulario de documentos `/driver/registration`
- ✅ Formulario solicita: placa, tarjeta de propiedad, cédula, seguro RCE

#### 5. Envío de Documentos por Email
- ✅ Backend configurado para enviar documentos a `gruaap3@gmail.com` via Resend
- ⚠️ **NOTA**: Resend requiere verificar dominio propio para enviar a otros emails
- Los documentos NO se guardan en BD, solo se envían por email

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
