# 👑 Manual de Administrador - TowNexus

## Guía Completa de Administración de la Plataforma
Este manual te ayudará a gestionar y monitorear toda la plataforma TowNexus.

---

## 1. Acceso al Panel de Administración

### Crear Usuario Administrador (Primera Vez)

**Método 1: Registro Manual + Modificación en Base de Datos**
1. Regístrate como usuario normal en la plataforma
2. Conecta a MongoDB:
   ```bash
   mongo
   use test_database
   ```
3. Cambia el rol a admin:
   ```javascript
   db.users.updateOne(
     {"email": "tu@email.com"},
     {"$set": {"role": "admin"}}
   )
   ```
4. Cierra sesión y vuelve a iniciar

**Método 2: Script de Creación (Recomendado para Producción)**
```python
# Crear en /app/backend/create_admin.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

async def create_admin():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    admin_email = "admin@townexus.com"
    admin_password = "Admin@2026Secure"  # Cambiar esto
    
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print("Admin ya existe")
        return
    
    hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "password": hashed_password.decode('utf-8'),
        "full_name": "Administrador",
        "phone": "+0000000000",
        "role": "admin",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reputation_score": 5.0,
        "status": "active"
    }
    
    await db.users.insert_one(admin_user)
    print(f"Admin creado: {admin_email}")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
```

Ejecutar:
```bash
cd /app/backend
python create_admin.py
```

### Iniciar Sesión como Admin
1. Ve a la página de login
2. Ingresa tus credenciales de administrador
3. Serás redirigido a `/admin/dashboard`

---

## 2. Dashboard Principal

### Métricas Clave

El dashboard muestra 4 métricas principales:

#### 1. **Total Servicios** (Cyan)
- Todos los servicios creados en la plataforma
- Incluye completados, activos y cancelados
- Útil para: Medir el volumen total de la plataforma

#### 2. **Servicios Activos** (Amarillo)
- Servicios en estados: accepted, on_way, picked_up, in_transit
- Excluye: created, negotiating, completed, cancelled
- Útil para: Monitoreo en tiempo real de operaciones

#### 3. **Usuarios** (Morado)
- Total de clientes registrados (role: client)
- No incluye conductores ni admins
- Útil para: Crecimiento de base de usuarios

#### 4. **Conductores** (Verde)
- Total de conductores registrados (role: driver)
- Incluye verificados y no verificados
- Útil para: Capacidad de oferta de servicios

### Métricas Financieras

#### **Ingresos Totales** (Grande, Cyan)
- Suma de todos los precios finales de servicios completados
- Fórmula: `SUM(final_price) WHERE status = 'completed'`
- No incluye servicios cancelados o en progreso

#### **Comisión Total** (Debajo de Ingresos)
- Ganancia de la plataforma
- Fórmula: `Ingresos Totales × Tasa de Comisión`
- Ejemplo: $10,000 × 15% = $1,500

### Gráfico de Servicios por Mes
- **Visualización**: Gráfico de barras (Recharts)
- **Datos**: Servicios completados por mes
- **Color**: Cyan (#00e0ff)
- **Uso**: Identificar tendencias y temporadas altas

### Acciones Rápidas
Dos botones principales:
1. **Gestionar Usuarios** → Te lleva a la gestión completa de usuarios
2. **Configurar Comisiones** → Ajusta las tasas de comisión

---

## 3. Gestión de Usuarios

### Acceder a Gestión de Usuarios
1. Desde el Dashboard, haz clic en **"Gestionar Usuarios"**
2. O navega a: **Menu → Usuarios**

### Vista General de Usuarios

Tabla con las siguientes columnas:

| Columna | Descripción | Formato |
|---------|-------------|----------|
| **Usuario** | Nombre completo | Texto |
| **Email** | Correo electrónico | email@example.com |
| **Teléfono** | Número de contacto | +1234567890 |
| **Rol** | client / driver / admin | Badge con color |
| **Estado** | active / blocked | Badge verde/rojo |
| **Reputación** | Calificación promedio | 4.5 ⭐ |
| **Acciones** | Botón Bloquear | Botón rojo |

### Buscar Usuarios
- Campo de búsqueda en la parte superior
- Busca por: Nombre o Email
- Actualización en tiempo real mientras escribes

### Colores de Badges

**Roles:**
- 🔵 Cliente (client): Azul
- 🟣 Conductor (driver): Morado
- 🔴 Admin (admin): Rojo

**Estados:**
- 🟢 Activo (active): Verde
- 🔴 Bloqueado (blocked): Rojo

### Bloquear Usuarios

**Cuándo Bloquear:**
- Comportamiento fraudulento
- Múltiples cancelaciones
- Calificaciones muy bajas consistentes
- Reportes de otros usuarios
- Violación de términos de servicio

**Cómo Bloquear:**
1. Encuentra al usuario en la tabla
2. Haz clic en el botón **"Bloquear"** (rojo con ícono de prohibición)
3. Confirma la acción
4. ✅ El usuario ya no podrá iniciar sesión
5. Su estado cambiará a "blocked"

**Efectos del Bloqueo:**
- ❌ No puede iniciar sesión
- ❌ No puede crear servicios (clientes)
- ❌ No puede ofertar (conductores)
- ✅ Los servicios en progreso se mantienen
- ✅ El historial se preserva

**Desbloquear Usuario:**
```javascript
// Método manual en MongoDB
db.users.updateOne(
  {"email": "usuario@example.com"},
  {"$set": {"status": "active"}}
)
```
*Nota: La función de desbloqueo puede agregarse al panel en futuras versiones*

### Sistema de Reputación

**Interpretación de Calificaciones:**
- ⭐⭐⭐⭐⭐ 5.0-4.8: Excelente - Usuario de confianza
- ⭐⭐⭐⭐ 4.7-4.0: Bueno - Usuario confiable
- ⭐⭐⭐ 3.9-3.0: Regular - Revisar historial
- ⭐⭐ 2.9-2.0: Malo - Considerar advertencia
- ⭐ 1.9-1.0: Muy Malo - Considerar bloqueo

**Monitoreo Proactivo:**
1. Ordena por reputación (menor a mayor)
2. Investiga usuarios con menos de 3.0
3. Revisa sus servicios y comentarios
4. Toma acción si es necesario

---

## 4. Configuración de Comisiones

### Acceder a Configuración
1. Dashboard → **"Configurar Comisiones"**
2. O Menu → **"Comisiones"**

### Tasa de Comisión Predeterminada

**Campo Principal:**
- Formato: Porcentaje (0-100)
- Valor por defecto: 15%
- Se aplica a todos los servicios

**Ejemplo de Cálculo:**
```
Precio del Servicio: $200
Comisión (15%): $30
Conductor recibe: $170
Plataforma recibe: $30
```

### Cómo Cambiar la Comisión

1. Ingresa el nuevo porcentaje (ejemplo: 12.5 para 12.5%)
2. Revisa la vista previa con ejemplos:
   - Servicio de $100
   - Servicio de $200
   - Servicio de $500
3. Haz clic en **"Guardar Configuración"**
4. ✅ Se aplicará a todos los servicios nuevos
5. Los servicios existentes mantienen su comisión original

### Estrategias de Comisión

**Comisión Baja (5-10%)**
- ✅ Atrae más conductores
- ✅ Precios más competitivos
- ❌ Menos ingresos para la plataforma
- **Ideal para**: Lanzamiento, crecimiento inicial

**Comisión Media (10-15%)**
- ✅ Balance entre competitividad e ingresos
- ✅ Estándar de la industria
- **Ideal para**: Operación normal

**Comisión Alta (15-25%)**
- ✅ Mayores ingresos
- ❌ Puede alejar conductores
- ❌ Precios más altos para clientes
- **Ideal para**: Plataformas establecidas con alta demanda

### Comisiones Avanzadas (Futuras Funciones)

El sistema está preparado para:
- **Por Tipo de Vehículo**: Carro 10%, Camión 15%
- **Por Zona**: Centro 12%, Afueras 8%
- **Por Hora**: Día 10%, Noche 15%
- **Por Distancia**: <10km 5%, >10km 10%

Estos campos existen en el modelo pero requieren implementación en el frontend.

---

## 5. Monitoreo de Servicios

### Estados de Servicio y su Significado

| Estado | Color | Significado | Acción Requerida |
|--------|-------|-------------|------------------|
| **Created** | Azul | Solicitud publicada | Normal - esperar ofertas |
| **Negotiating** | Amarillo | Recibiendo ofertas | Normal - proceso de negociación |
| **Accepted** | Verde | Oferta aceptada | Normal - conductor debe iniciar |
| **On Way** | Cyan | Conductor en camino | Normal - en progreso |
| **Picked Up** | Morado | Vehículo cargado | Normal - en tránsito |
| **In Transit** | Índigo | Viajando a destino | Normal - casi completado |
| **Completed** | Verde Esmeralda | Servicio finalizado | ✅ Cobrar comisión |
| **Cancelled** | Rojo | Servicio cancelado | ⚠️ Investigar razón |

### Banderas Rojas a Monitorear

🚩 **Servicio en "Accepted" por más de 2 horas**
- Posible problema: Conductor no se mueve
- Acción: Contactar conductor y cliente

🚩 **Múltiples cancelaciones del mismo usuario**
- Posible fraude o abuso
- Acción: Revisar historial, considerar bloqueo

🚩 **Servicio en "On Way" por tiempo excesivo**
- Posible problema técnico o disputa
- Acción: Contactar partes involucradas

🚩 **Calificación de 1 estrella en servicio completado**
- Indica problema serio
- Acción: Revisar comentarios, mediar si es necesario

### Dashboard de Monitoreo (Recomendación)

Puedes usar MongoDB Compass o crear consultas:

```javascript
// Servicios activos hace más de 3 horas
db.services.find({
  status: {$in: ["accepted", "on_way"]},
  created_at: {$lt: new Date(Date.now() - 3*60*60*1000)}
})

// Usuarios con más de 3 cancelaciones
db.services.aggregate([
  {$match: {status: "cancelled"}},
  {$group: {_id: "$client_id", count: {$sum: 1}}},
  {$match: {count: {$gt: 3}}}
])
```

---

## 6. Análisis y Reportes

### Métricas Clave a Monitorear

#### Crecimiento
- Nuevos usuarios por día/semana/mes
- Nuevos conductores por período
- Tasa de retención (usuarios que regresan)

#### Operaciones
- Servicios completados vs cancelados
- Tiempo promedio de respuesta (oferta → aceptación)
- Tiempo promedio de servicio (solicitud → completado)

#### Financieras
- Ingresos totales por período
- Comisiones generadas
- Precio promedio de servicio
- GMV (Gross Merchandise Value)

#### Calidad
- Calificación promedio de conductores
- Calificación promedio de clientes
- Tasa de quejas/disputas

### Consultas Útiles en MongoDB

**Servicios por Día (Último Mes):**
```javascript
db.services.aggregate([
  {
    $match: {
      created_at: {
        $gte: new Date(Date.now() - 30*24*60*60*1000)
      }
    }
  },
  {
    $group: {
      _id: {$dateToString: {format: "%Y-%m-%d", date: "$created_at"}},
      count: {$sum: 1},
      revenue: {$sum: "$final_price"}
    }
  },
  {$sort: {_id: 1}}
])
```

**Top 10 Conductores por Ingresos:**
```javascript
db.services.aggregate([
  {$match: {status: "completed"}},
  {
    $group: {
      _id: "$driver_id",
      total_earnings: {$sum: "$final_price"},
      completed_services: {$sum: 1}
    }
  },
  {$sort: {total_earnings: -1}},
  {$limit: 10}
])
```

**Tasa de Conversión (Ofertas → Aceptadas):**
```javascript
// Total ofertas
db.offers.countDocuments({})

// Ofertas aceptadas
db.offers.countDocuments({status: "accepted"})

// Tasa = (aceptadas / total) × 100
```

### Exportar Reportes

**Método Manual (MongoDB):**
```bash
mongoexport --db=test_database --collection=services \
  --query='{"status":"completed"}' \
  --out=services_completed.json
```

**Método Programático (Python):**
```python
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def export_services():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    services = await db.services.find(
        {"status": "completed"},
        {"_id": 0}
    ).to_list(10000)
    
    df = pd.DataFrame(services)
    df.to_excel("services_report.xlsx", index=False)
    print("Reporte exportado a services_report.xlsx")

asyncio.run(export_services())
```

---

## 7. Sistema de Chat y Comunicación

### Monitoreo de Conversaciones

**Ver Mensajes de un Servicio:**
```javascript
db.chat_messages.find({service_id: "SERVICE_ID_AQUI"})
```

### Moderación de Contenido

Señales de alerta en el chat:
- 🚩 Solicitudes de pago fuera de la plataforma
- 🚩 Intercambio de información bancaria
- 🚩 Lenguaje abusivo o amenazante
- 🚩 Intentos de evadir comisiones

**Acción Recomendada:**
1. Revisar el contexto completo
2. Advertir a los usuarios involucrados
3. Si es reincidente, bloquear cuenta
4. Considerar agregar filtros automáticos

---

## 8. Gestión de Disputas

### Tipos Comunes de Disputas

#### 1. **Disputa de Precio**
- Cliente dice que se acordó un precio diferente
- **Solución**: Revisar chat, ver precio en la oferta aceptada
- **Decisión**: El precio en la oferta aceptada es vinculante

#### 2. **Daño al Vehículo**
- Cliente reclama que el conductor dañó el vehículo
- **Solución**: Revisar fotos de recogida y entrega
- **Decisión**: Si no hay evidencia fotográfica, favor al cliente

#### 3. **Servicio No Completado**
- Conductor marcó como completado pero cliente dice que no
- **Solución**: Revisar estados, chat y ubicación
- **Decisión**: Basada en evidencia (fotos, mensajes)

#### 4. **Cancelación con Penalización**
- Conductor cancela después de aceptar
- **Solución**: Verificar razón, tiempo transcurrido
- **Decisión**: Penalizar si no hay justificación válida

### Proceso de Mediación

1. **Recopilar Información**
   - Historial del servicio
   - Mensajes del chat
   - Fotos subidas
   - Calificaciones anteriores de ambas partes

2. **Contactar Ambas Partes**
   - Escuchar versión de cada uno
   - Ser neutral y profesional
   - Solicitar evidencia adicional si es necesario

3. **Tomar Decisión**
   - Basada en evidencia, no en emociones
   - Documentar la resolución
   - Informar a ambas partes

4. **Aplicar Consecuencias**
   - Reembolso parcial/total si corresponde
   - Advertencia al conductor/cliente
   - Bloqueo en casos graves

---

## 9. Configuración Avanzada del Sistema

### Variables de Entorno Críticas

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
JWT_SECRET=tow-nexus-secret-key-2026-secure
```

⚠️ **Importante en Producción:**
- Cambiar `JWT_SECRET` a algo único y complejo
- Configurar `CORS_ORIGINS` solo a dominios permitidos
- Usar MongoDB Atlas o servicio gestionado
- Habilitar autenticación en MongoDB

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://tow-truck-bids.preview.emergentagent.com
```

### Seguridad

**Mejores Prácticas:**
1. ✅ Usar HTTPS en producción (ya configurado en Emergent)
2. ✅ Cambiar JWT_SECRET a valor único
3. ✅ Implementar rate limiting (límite de requests)
4. ✅ Habilitar logs de auditoría
5. ✅ Backup diario de MongoDB
6. ✅ Monitorear intentos de login fallidos

**Agregar Rate Limiting (Opcional):**
```python
# pip install slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@api_router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, data: UserLogin):
    # código existente
```

---

## 10. Backup y Recuperación

### Backup de MongoDB

**Backup Manual:**
```bash
mongodump --db=test_database --out=/path/to/backup/$(date +%Y%m%d)
```

**Automatizar con Cron (Linux):**
```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * mongodump --db=test_database --out=/backups/$(date +\%Y\%m\%d)
```

**Restaurar Backup:**
```bash
mongorestore --db=test_database /path/to/backup/20260223/test_database
```

### Backup del Código

**Usando Git (Recomendado):**
```bash
cd /app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuusuario/townexus.git
git push -u origin main
```

**Backup Manual:**
```bash
tar -czf townexus_backup_$(date +%Y%m%d).tar.gz /app
```

---

## 11. Escalabilidad y Optimización

### Cuándo Escalar

Señales de que necesitas escalar:
- 🔴 Respuestas lentas (>3 segundos)
- 🔴 Más de 100 usuarios concurrentes
- 🔴 Más de 1000 servicios por día
- 🔴 Base de datos >10GB

### Estrategias de Escalabilidad

1. **Base de Datos**
   - Migrar a MongoDB Atlas (escalado automático)
   - Implementar índices en campos frecuentes:
     ```javascript
     db.services.createIndex({"status": 1, "created_at": -1})
     db.users.createIndex({"email": 1}, {unique: true})
     db.offers.createIndex({"service_id": 1})
     ```

2. **Backend**
   - Usar múltiples workers de Uvicorn
   - Implementar caché con Redis
   - Separar WebSocket server si es necesario

3. **Frontend**
   - Implementar CDN para assets estáticos
   - Lazy loading de componentes
   - Optimizar imágenes

---

## 12. Solución de Problemas Comunes

### Backend No Responde

**Diagnóstico:**
```bash
sudo supervisorctl status backend
tail -n 50 /var/log/supervisor/backend.err.log
```

**Solución:**
```bash
sudo supervisorctl restart backend
```

### Frontend No Carga

**Diagnóstico:**
```bash
sudo supervisorctl status frontend
tail -n 50 /var/log/supervisor/frontend.err.log
```

**Solución:**
```bash
sudo supervisorctl restart frontend
```

### MongoDB Connection Error

**Verificar MongoDB:**
```bash
sudo systemctl status mongodb
# o
sudo service mongodb status
```

**Reiniciar:**
```bash
sudo systemctl restart mongodb
```

### WebSocket No Conecta

**Verificar:**
1. Backend está corriendo
2. CORS configurado correctamente
3. Frontend usa la URL correcta

**Debug en Frontend:**
```javascript
// En navegador (F12 > Console)
console.log(socket.connected); // debe ser true
```

---

## 13. Roadmap y Futuras Funciones

### Prioridad Alta
- [ ] Sistema de pagos integrado (Stripe)
- [ ] Notificaciones push (web + móvil)
- [ ] App móvil (React Native)
- [ ] Panel de conductor verificado
- [ ] Sistema de cupones/descuentos

### Prioridad Media
- [ ] Programa de fidelidad
- [ ] Comisiones dinámicas por zona/tipo
- [ ] Chat con soporte en vivo
- [ ] Filtros avanzados de búsqueda
- [ ] Analytics dashboard mejorado

### Prioridad Baja
- [ ] Integración con APIs de tráfico
- [ ] Predicción de demanda con ML
- [ ] Sistema de referidos
- [ ] Marketplace de servicios adicionales

---

## 14. Mejores Prácticas de Administración

### Rutina Diaria
- [ ] Revisar Dashboard (5 min)
- [ ] Verificar servicios activos sin movimiento (5 min)
- [ ] Revisar nuevos registros de conductores (10 min)
- [ ] Monitorear calificaciones bajas (5 min)

### Rutina Semanal
- [ ] Analizar métricas de crecimiento (30 min)
- [ ] Revisar disputas pendientes (1 hora)
- [ ] Backup manual de base de datos (10 min)
- [ ] Actualizar documentación si hay cambios (20 min)

### Rutina Mensual
- [ ] Análisis financiero completo (2 horas)
- [ ] Revisar y ajustar comisiones si es necesario (30 min)
- [ ] Auditoría de seguridad (1 hora)
- [ ] Planificar nuevas funcionalidades (2 horas)

---

## 15. Contacto y Soporte

### Soporte Técnico de la Plataforma
- **Email**: support@emergent.sh
- **Documentación**: https://emergent.sh/docs

### Comunidad de Desarrolladores
- GitHub Issues (si es open source)
- Discord / Slack de la plataforma

---

## Checklist de Lanzamiento

### Antes de Producción
- [ ] Cambiar JWT_SECRET
- [ ] Configurar MongoDB con autenticación
- [ ] Configurar CORS solo para dominios permitidos
- [ ] Implementar HTTPS
- [ ] Crear usuario admin de producción
- [ ] Configurar backups automáticos
- [ ] Implementar monitoreo (Sentry, LogRocket)
- [ ] Configurar rate limiting
- [ ] Probar todos los flujos end-to-end
- [ ] Documentar procesos internos
- [ ] Capacitar equipo de soporte

### Post-Lanzamiento
- [ ] Monitoreo 24/7 primera semana
- [ ] Soporte prioritario a primeros usuarios
- [ ] Recolectar feedback activamente
- [ ] Iterar basado en datos reales

---

**¡Éxito Administrando TowNexus!** 👑

Tu liderazgo y decisiones estratégicas harán crecer esta plataforma.