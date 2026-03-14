"""
GruaApp Backend - Punto de entrada para Uvicorn
Este archivo sirve como wrapper para mantener compatibilidad con supervisor
La lógica real está en main.py y los routers modulares
"""
from main import app, socket_app

# Re-exportar para uvicorn (server:socket_app)
__all__ = ['app', 'socket_app']
