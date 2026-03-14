"""
Configuración de base de datos MongoDB
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def close_db():
    """Cierra la conexión a la base de datos"""
    client.close()

async def get_db():
    """Obtiene la instancia de la base de datos"""
    return db
