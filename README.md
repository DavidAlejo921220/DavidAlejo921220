# 🚀 TowNexus - Marketplace de Asistencia Vehicular

![TowNexus](https://customer-assets.emergentagent.com/job_tow-nexus/artifacts/ykgd2d1v_WhatsApp%20Image%202026-02-23%20at%207.40.40%20PM.jpeg)

**Plataforma tipo InDriver para servicios de grúa con sistema de ofertas, chat en tiempo real y 3 interfaces independientes.**

---

## 🌟 Características Principales

### 🎯 Sistema de Oferta-Demanda
- Clientes publican solicitudes de servicio
- Conductores envían ofertas personalizadas
- Cliente elige la mejor oferta basada en precio y tiempo

### 💬 Chat en Tiempo Real
- Comunicación directa cliente-conductor
- WebSockets nativos con Socket.io
- Envío de ubicación en tiempo real
- Historial de mensajes persistente

### 🗺️ Mapas Interactivos
- Leaflet + OpenStreetMap (gratuito)
- Selección visual de ubicaciones
- Tema oscuro personalizado
- Marcadores para pickup y destino

### ⭐ Sistema de Reputación Bidireccional
- Cliente califica conductor
- Conductor califica cliente
- Score visible para todos
- Impacta en futuras oportunidades

### 👑 Panel Administrativo Completo
- Dashboard con métricas en tiempo real
- Gestión de usuarios y conductores
- Configuración de comisiones
- Bloqueo de usuarios
- Reportes y analytics

---

## 🏗️ Arquitectura

### Backend
- **Framework**: FastAPI
- **Base de Datos**: MongoDB (Motor - async)
- **Autenticación**: JWT + bcrypt
- **Tiempo Real**: Socket.io (python-socketio)
- **Validación**: Pydantic models

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **Estilos**: TailwindCSS + Shadcn/UI
- **Mapas**: React Leaflet
- **Charts**: Recharts
- **Estado**: Context API + Hooks
- **Notificaciones**: Sonner

### Comunicación
- **API REST**: Axios
- **WebSockets**: Socket.io-client
- **Formato**: JSON

---

## 🎨 Diseño

### Paleta de Colores
- **Primary**: Cyan (#00e0ff)
- **Secondary**: Purple (#7200c4)
- **Background**: Dark (#0a1120, #111827)
- **Accent**: Cyan variations

### Tipografía
- **Headings**: Rajdhani (bold, futurista)
- **Body**: Inter (clean, legible)

### Estilo Visual
- Futuristic Tech / Cyberpunk Lite
- Glass-morphism effects
- Neon glow on buttons
- Dark theme by default
- Smooth transitions

---

## 📁 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py          # FastAPI app + WebSockets
│   ├── models.py          # Pydantic models
│   ├── utils.py           # OTP generation, helpers
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main component + routing
│   │   ├── contexts/
│   │   │   ├── AuthContext.js        # Auth state management
│   │   │   └── SocketContext.js      # WebSocket connection
│   │   ├── pages/
│   │   │   ├── Landing.js            # Landing page
│   │   │   ├── Login.js              # Login page
│   │   │   ├── Register.js           # Registration + OTP
│   │   │   ├── Chat.js               # Real-time chat
│   │   │   ├── client/               # Client pages
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── CreateService.js
│   │   │   │   └── MyServices.js
│   │   │   ├── driver/               # Driver pages
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── AvailableServices.js
│   │   │   │   └── MyServices.js
│   │   │   └── admin/                # Admin pages
│   │   │       ├── Dashboard.js
│   │   │       ├── Users.js
│   │   │       └── Commission.js
│   │   ├── components/ui/            # Shadcn components
│   │   ├── index.css                 # Global styles + Tailwind
│   │   └── App.css                   # Component styles
│   ├── package.json
│   └── .env
│
├── MANUAL_CLIENTE.md              # Manual de usuario cliente
├── MANUAL_CONDUCTOR.md            # Manual de usuario conductor
├── MANUAL_ADMINISTRADOR.md        # Manual de administrador
└── design_guidelines.json         # Guías de diseño
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Python 3.11+
- MongoDB 6+

### 1. Clonar Repositorio
```bash
git clone <tu-repo>
cd townexus
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

**Variables de entorno requeridas (backend/.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=townexus_db
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=tu-secreto-super-seguro-cambia-esto
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu backend URL
```

**Variables de entorno requeridas (frontend/.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Iniciar MongoDB
```bash
# Linux/Mac
sudo systemctl start mongodb

# O con Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 5. Iniciar Backend
```bash
cd backend
uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload
```

### 6. Iniciar Frontend
```bash
cd frontend
yarn start
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## 👥 Crear Usuario Administrador

### Método 1: Desde MongoDB
```bash
mongo
use townexus_db
db.users.updateOne(
  {"email": "tu@email.com"},
  {"$set": {"role": "admin"}}
)
```

### Método 2: Script Python
```python
# backend/create_admin.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timezone
import os

async def create_admin():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@townexus.com",
        "password": bcrypt.hashpw("Admin123!".encode(), bcrypt.gensalt()).decode(),
        "full_name": "Administrador",
        "phone": "+0000000000",
        "role": "admin",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reputation_score": 5.0,
        "status": "active"
    }
    
    await db.users.insert_one(admin_user)
    print("Admin creado: admin@townexus.com / Admin123!")
    client.close()

asyncio.run(create_admin())
```

Ejecutar:
```bash
cd backend
python create_admin.py
```

---

## 📚 Documentación

### Manuales de Usuario
- 📖 [Manual de Cliente](MANUAL_CLIENTE.md) - Guía completa para usuarios que necesitan grúa
- 🚛 [Manual de Conductor](MANUAL_CONDUCTOR.md) - Guía para operadores de grúa
- 👑 [Manual de Administrador](MANUAL_ADMINISTRADOR.md) - Guía de administración completa

### API Endpoints

#### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/verify-otp` - Verificar código OTP
- `POST /api/auth/resend-otp` - Reenviar OTP

#### Servicios (Cliente)
- `POST /api/services/create` - Crear solicitud de servicio
- `GET /api/services/my-services` - Mis servicios
- `GET /api/offers/service/{id}` - Ver ofertas de un servicio
- `POST /api/offers/{id}/accept` - Aceptar oferta

#### Servicios (Conductor)
- `GET /api/services/available` - Servicios disponibles
- `POST /api/offers/create` - Enviar oferta
- `POST /api/services/{id}/update-status` - Actualizar estado

#### Chat
- `POST /api/chat/send` - Enviar mensaje
- `GET /api/chat/{service_id}` - Obtener mensajes

#### Administración
- `GET /api/admin/dashboard` - Métricas del dashboard
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users/{id}/block` - Bloquear usuario
- `GET /api/admin/commission-config` - Obtener configuración de comisiones
- `POST /api/admin/commission-config` - Actualizar comisiones

### WebSocket Events

#### Cliente
```javascript
socket.on('new_offer', (offer) => {
  // Nueva oferta recibida
});

socket.on('status_updated', (data) => {
  // Estado del servicio actualizado
});

socket.on('new_message', (message) => {
  // Nuevo mensaje en el chat
});
```

#### Conductor
```javascript
socket.on('new_service', (service) => {
  // Nuevo servicio disponible
});

socket.on('offer_accepted', (data) => {
  // Tu oferta fue aceptada
});
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas
- ✅ JWT con expiración de 24 horas
- ✅ Passwords hasheados con bcrypt
- ✅ Verificación OTP para nuevos usuarios
- ✅ CORS configurado
- ✅ Validación de datos con Pydantic
- ✅ MongoDB sin campos _id expuestos

### Para Producción (TODO)
- [ ] Cambiar JWT_SECRET a valor único y complejo
- [ ] Implementar rate limiting
- [ ] Configurar HTTPS
- [ ] Usar MongoDB Atlas con autenticación
- [ ] Implementar refresh tokens
- [ ] Agregar logs de auditoría
- [ ] Configurar CORS solo para dominios específicos

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
yarn test
```

### E2E (Manual)
1. Registrar usuario cliente
2. Crear servicio
3. Registrar usuario conductor
4. Enviar oferta
5. Aceptar oferta
6. Chat entre ambos
7. Actualizar estados
8. Completar servicio
9. Calificar

---

## 📊 Base de Datos

### Colecciones MongoDB

#### users
```javascript
{
  id: String,
  email: String (unique),
  password: String (hashed),
  full_name: String,
  phone: String,
  role: "client" | "driver" | "admin",
  verified: Boolean,
  otp_code: String,
  otp_expiry: Date,
  reputation_score: Number,
  status: "active" | "blocked",
  created_at: Date
}
```

#### services
```javascript
{
  id: String,
  client_id: String,
  driver_id: String (nullable),
  vehicle_type: String,
  vehicle_brand: String,
  vehicle_model: String,
  vehicle_condition: String,
  pickup_location: {lat: Number, lng: Number},
  destination_location: {lat: Number, lng: Number},
  pickup_address: String,
  destination_address: String,
  description: String,
  photos: [String],
  status: String,
  final_price: Number,
  created_at: Date,
  updated_at: Date
}
```

#### offers
```javascript
{
  id: String,
  service_id: String,
  driver_id: String,
  price: Number,
  message: String,
  status: "pending" | "accepted" | "rejected",
  created_at: Date
}
```

#### chat_messages
```javascript
{
  id: String,
  service_id: String,
  sender_id: String,
  message: String,
  message_type: "text" | "location",
  location: {lat: Number, lng: Number},
  created_at: Date
}
```

#### ratings
```javascript
{
  id: String,
  service_id: String,
  from_user_id: String,
  to_user_id: String,
  rating: Number (1-5),
  comment: String,
  created_at: Date
}
```

---

## 🚀 Deployment

### Opción 1: Emergent Platform (Actual)
- Ya está desplegado en: https://tow-truck-bids.preview.emergentagent.com
- Deployment automático con cada commit

### Opción 2: Vercel + Railway
**Frontend (Vercel):**
```bash
cd frontend
vercel
```

**Backend (Railway):**
1. Conectar repositorio a Railway
2. Agregar servicio MongoDB
3. Configurar variables de entorno
4. Deploy automático

### Opción 3: AWS / GCP / Azure
- Frontend: S3 + CloudFront / Cloud Storage
- Backend: EC2 / Compute Engine / App Service
- Database: MongoDB Atlas
- Load Balancer para escalabilidad

---

## 🔧 Solución de Problemas

### Backend no inicia
```bash
# Verificar logs
tail -f backend/logs/error.log

# Verificar MongoDB
sudo systemctl status mongodb

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Frontend no compila
```bash
# Limpiar cache
rm -rf node_modules package-lock.json yarn.lock
yarn install

# Verificar versión de Node
node --version  # Debe ser 18+
```

### WebSockets no conectan
- Verificar CORS en backend
- Verificar URL de backend en frontend/.env
- Verificar firewall/puertos

### OTP no llega
- En desarrollo, el OTP se imprime en consola del backend
- Para producción, configurar servicio de email (Resend, SendGrid)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📝 Roadmap

### v1.1 (Próximo)
- [ ] Sistema de pagos (Stripe)
- [ ] Notificaciones push
- [ ] Panel de verificación de conductores
- [ ] Email real para OTP

### v1.2
- [ ] App móvil (React Native)
- [ ] Comisiones dinámicas por zona
- [ ] Sistema de cupones
- [ ] Chat con archivos

### v2.0
- [ ] Predicción de demanda con ML
- [ ] Integración con APIs de tráfico
- [ ] Sistema de referidos
- [ ] Analytics avanzado

---

## 📄 Licencia

Este proyecto es propiedad de **iPcLab / Davidtech**.

---

## 👨‍💻 Desarrollado por

**Davidtech** - Desarrollo Web & Software

Powered by **Emergent AI** 🤖

---

## 🆘 Soporte

- 📧 Email: support@emergent.sh
- 📚 Documentación: Ver manuales en `/MANUAL_*.md`
- 💬 Issues: GitHub Issues

---

**¡Gracias por usar TowNexus!** 🚀🚛
