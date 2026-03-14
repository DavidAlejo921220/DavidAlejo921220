"""
Paquete de routers para GruaApp
"""
from .auth_router import router as auth_router
from .drivers_router import router as drivers_router
from .services_router import router as services_router
from .offers_router import router as offers_router
from .chat_router import router as chat_router
from .ratings_router import router as ratings_router
from .admin_router import router as admin_router

__all__ = [
    'auth_router',
    'drivers_router', 
    'services_router',
    'offers_router',
    'chat_router',
    'ratings_router',
    'admin_router'
]
