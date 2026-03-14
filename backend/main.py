"""
GruaApp Backend - API Principal
Arquitectura modular y escalable para marketplace de grúas
"""
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging
import socketio

from config import CORS_ORIGINS
from database import close_db
from websocket_manager import sio

# Importar todos los routers
from routers import (
    auth_router,
    drivers_router,
    services_router,
    offers_router,
    chat_router,
    ratings_router,
    admin_router
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="GruaApp API",
    description="API para marketplace de servicios de grúa",
    version="1.0.0"
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Endpoint de salud para monitoreo"""
    return {"status": "healthy", "service": "GruaApp API", "version": "1.0.0"}

# Registrar routers con prefijo /api
app.include_router(auth_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(services_router, prefix="/api")
app.include_router(offers_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(ratings_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Eventos de ciclo de vida
@app.on_event("shutdown")
async def shutdown_event():
    """Cierra conexiones al apagar el servidor"""
    await close_db()
    logger.info("Database connection closed")

# Crear aplicación ASGI con Socket.IO
socket_app = socketio.ASGIApp(sio, app)
