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
    
    admin_email = "admin@gruaapp.com"
    admin_password = "Admin2026!"
    
    # Verificar si ya existe
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print("❌ Admin ya existe")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        client.close()
        return
    
    hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "password": hashed_password.decode('utf-8'),
        "full_name": "Administrador GruaApp",
        "phone": "+573001234567",
        "role": "admin",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reputation_score": 5.0,
        "status": "active"
    }
    
    await db.users.insert_one(admin_user)
    
    print("✅ Usuario administrador creado exitosamente!")
    print("=" * 50)
    print(f"📧 Email: {admin_email}")
    print(f"🔑 Password: {admin_password}")
    print("=" * 50)
    print("\n⚠️  IMPORTANTE: Guarda estas credenciales de forma segura")
    print("🔗 Accede en: https://driver-client-hub-1.preview.emergentagent.com/login")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
