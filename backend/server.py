from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import socketio
from typing import Dict, Set

from models import *
from utils import send_otp_email, generate_otp, calculate_distance

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

active_connections: Dict[str, Set[str]] = {}

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())
    otp_code = generate_otp()
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "password": hashed_password.decode('utf-8'),
        "full_name": data.full_name,
        "phone": data.phone,
        "role": data.role,
        "verified": False,
        "otp_code": otp_code,
        "otp_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reputation_score": 5.0,
        "status": "active"
    }
    
    await db.users.insert_one(user_dict)
    await send_otp_email(data.email, otp_code)
    
    token = create_token(user_dict['id'], user_dict['role'])
    return AuthResponse(
        token=token,
        user=UserResponse(**{k: v for k, v in user_dict.items() if k != 'password'}),
        message="Usuario registrado. Verifica tu email con el código OTP."
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not bcrypt.checkpw(data.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if user['status'] == 'blocked':
        raise HTTPException(status_code=403, detail="Usuario bloqueado")
    
    token = create_token(user['id'], user['role'])
    return AuthResponse(
        token=token,
        user=UserResponse(**{k: v for k, v in user.items() if k != 'password'}),
        message="Login exitoso"
    )

@api_router.post("/auth/verify-otp", response_model=dict)
async def verify_otp(data: OTPVerify, payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user.get('verified'):
        return {"message": "Usuario ya verificado"}
    
    if user.get('otp_code') != data.otp_code:
        raise HTTPException(status_code=400, detail="Código OTP inválido")
    
    if datetime.fromisoformat(user.get('otp_expiry')) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Código OTP expirado")
    
    await db.users.update_one({"id": payload['user_id']}, {"$set": {"verified": True}})
    return {"message": "Usuario verificado exitosamente"}

@api_router.post("/auth/resend-otp", response_model=dict)
async def resend_otp(payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    otp_code = generate_otp()
    await db.users.update_one(
        {"id": payload['user_id']},
        {"$set": {
            "otp_code": otp_code,
            "otp_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
        }}
    )
    
    await send_otp_email(user['email'], otp_code)
    return {"message": "Código OTP reenviado"}

@api_router.post("/drivers/register", response_model=dict)
async def register_driver(data: DriverRegister, payload: dict = Depends(verify_token)):
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores pueden registrar vehículos")
    
    driver_dict = {
        "id": str(uuid.uuid4()),
        "user_id": payload['user_id'],
        **data.model_dump(),
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.drivers.insert_one(driver_dict)
    return {"message": "Información de conductor registrada. Pendiente de verificación."}

@api_router.post("/drivers/availability", response_model=dict)
async def update_driver_availability(data: DriverAvailabilityUpdate, payload: dict = Depends(verify_token)):
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    update_data = {"available": data.available}
    
    if data.current_location:
        update_data["current_location"] = data.current_location
        update_data["last_location_update"] = datetime.now(timezone.utc).isoformat()
    
    await db.drivers.update_one(
        {"user_id": payload['user_id']},
        {"$set": update_data}
    )
    
    await sio.emit('driver_availability_changed', {
        'driver_id': payload['user_id'],
        'available': data.available,
        'location': data.current_location
    }, room='all_clients')
    
    return {"message": "Disponibilidad actualizada"}

@api_router.get("/drivers/available", response_model=list)
async def get_available_drivers():
    """Obtiene todos los conductores disponibles con su ubicación"""
    drivers = await db.drivers.find(
        {"available": True},
        {"_id": 0}
    ).to_list(1000)
    
    result = []
    for driver in drivers:
        user = await db.users.find_one({"id": driver['user_id']}, {"_id": 0, "password": 0})
        if user:
            result.append({
                "driver_id": driver['user_id'],
                "full_name": user['full_name'],
                "reputation_score": user['reputation_score'],
                "vehicle_type": driver['vehicle_type'],
                "vehicle_brand": driver['vehicle_brand'],
                "vehicle_model": driver['vehicle_model'],
                "current_location": driver.get('current_location'),
                "driver_photo_url": driver.get('driver_photo_url'),
                "vehicle_photo_url": driver.get('vehicle_photo_url')
            })
    
    return result

@api_router.post("/drivers/location", response_model=dict)
async def update_driver_location(data: LocationUpdate, payload: dict = Depends(verify_token)):
    """Actualiza ubicación del conductor en tiempo real"""
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    await db.drivers.update_one(
        {"user_id": payload['user_id']},
        {"$set": {
            "current_location": data.location,
            "last_location_update": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await sio.emit('driver_location_update', {
        'service_id': data.service_id,
        'driver_id': payload['user_id'],
        'location': data.location
    }, room=f'service_{data.service_id}')
    
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if service and service.get('pickup_location'):
        distance = calculate_distance(
            data.location['lat'],
            data.location['lng'],
            service['pickup_location']['lat'],
            service['pickup_location']['lng']
        )
        
        if distance < 0.5:
            await sio.emit('driver_nearby', {
                'service_id': data.service_id,
                'driver_id': payload['user_id'],
                'distance_meters': int(distance * 1000),
                'message': f'¡La grúa está a {int(distance * 1000)} metros de distancia!'
            }, room=f'service_{data.service_id}')
    
    return {"message": "Ubicación actualizada"}


@api_router.post("/services/create", response_model=ServiceResponse)
async def create_service(data: ServiceCreate, payload: dict = Depends(verify_token)):
    if payload['role'] != 'client':
        raise HTTPException(status_code=403, detail="Solo clientes pueden crear servicios")
    
    service_dict = {
        "id": str(uuid.uuid4()),
        "client_id": payload['user_id'],
        **data.model_dump(),
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.services.insert_one(service_dict)
    
    await sio.emit('new_service', {
        'service_id': service_dict['id'],
        'pickup_location': service_dict['pickup_location'],
        'vehicle_type': service_dict['vehicle_type']
    }, room='drivers')
    
    return ServiceResponse(**service_dict)

@api_router.get("/services/available", response_model=list[ServiceResponse])
async def get_available_services(payload: dict = Depends(verify_token)):
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    driver = await db.drivers.find_one({"user_id": payload['user_id']}, {"_id": 0})
    
    services = await db.services.find(
        {"status": {"$in": ["created", "negotiating"]}},
        {"_id": 0}
    ).to_list(100)
    
    if driver and driver.get('current_location'):
        driver_location = driver['current_location']
        services_with_distance = []
        
        for service in services:
            if service.get('pickup_location'):
                distance = calculate_distance(
                    driver_location['lat'],
                    driver_location['lng'],
                    service['pickup_location']['lat'],
                    service['pickup_location']['lng']
                )
                service['distance_to_driver'] = round(distance, 2)
                services_with_distance.append(service)
        
        services_with_distance.sort(key=lambda x: x.get('distance_to_driver', float('inf')))
        return [ServiceResponse(**s) for s in services_with_distance]
    
    return [ServiceResponse(**s) for s in services]

@api_router.get("/services/my-services", response_model=list[ServiceResponse])
async def get_my_services(payload: dict = Depends(verify_token)):
    query = {}
    if payload['role'] == 'client':
        query['client_id'] = payload['user_id']
    elif payload['role'] == 'driver':
        accepted_offers = await db.offers.find(
            {"driver_id": payload['user_id'], "status": "accepted"},
            {"_id": 0, "service_id": 1}
        ).to_list(100)
        service_ids = [o['service_id'] for o in accepted_offers]
        query['id'] = {"$in": service_ids}
    
    services = await db.services.find(query, {"_id": 0}).to_list(100)
    return [ServiceResponse(**s) for s in services]

@api_router.post("/offers/create", response_model=OfferResponse)
async def create_offer(data: OfferCreate, payload: dict = Depends(verify_token)):
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    offer_dict = {
        "id": str(uuid.uuid4()),
        "service_id": data.service_id,
        "driver_id": payload['user_id'],
        "price": data.price,
        "message": data.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.offers.insert_one(offer_dict)
    await db.services.update_one({"id": data.service_id}, {"$set": {"status": "negotiating"}})
    
    await sio.emit('new_offer', offer_dict, room=f'service_{data.service_id}')
    
    return OfferResponse(**offer_dict)

@api_router.get("/offers/service/{service_id}", response_model=list[OfferResponse])
async def get_service_offers(service_id: str, payload: dict = Depends(verify_token)):
    offers = await db.offers.find({"service_id": service_id}, {"_id": 0}).to_list(100)
    return [OfferResponse(**o) for o in offers]

@api_router.post("/offers/{offer_id}/accept", response_model=dict)
async def accept_offer(offer_id: str, payload: dict = Depends(verify_token)):
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    service = await db.services.find_one({"id": offer['service_id']}, {"_id": 0})
    if service['client_id'] != payload['user_id']:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    await db.offers.update_one({"id": offer_id}, {"$set": {"status": "accepted"}})
    await db.offers.update_many(
        {"service_id": offer['service_id'], "id": {"$ne": offer_id}},
        {"$set": {"status": "rejected"}}
    )
    await db.services.update_one(
        {"id": offer['service_id']},
        {"$set": {"status": "accepted", "driver_id": offer['driver_id'], "final_price": offer['price']}}
    )
    
    await sio.emit('offer_accepted', {"offer_id": offer_id}, room=f'driver_{offer["driver_id"]}')
    
    return {"message": "Oferta aceptada"}

@api_router.post("/services/{service_id}/update-status", response_model=dict)
async def update_service_status(service_id: str, data: ServiceStatusUpdate, payload: dict = Depends(verify_token)):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await sio.emit('status_updated', {"service_id": service_id, "status": data.status}, room=f'service_{service_id}')
    
    return {"message": "Estado actualizado"}

@api_router.post("/chat/send", response_model=ChatMessageResponse)
async def send_message(data: ChatMessageCreate, payload: dict = Depends(verify_token)):
    message_dict = {
        "id": str(uuid.uuid4()),
        "service_id": data.service_id,
        "sender_id": payload['user_id'],
        "message": data.message,
        "message_type": data.message_type,
        "location": data.location,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_messages.insert_one(message_dict)
    await sio.emit('new_message', message_dict, room=f'service_{data.service_id}')
    
    return ChatMessageResponse(**message_dict)

@api_router.get("/chat/{service_id}", response_model=list[ChatMessageResponse])
async def get_chat_messages(service_id: str, payload: dict = Depends(verify_token)):
    messages = await db.chat_messages.find({"service_id": service_id}, {"_id": 0}).to_list(1000)
    return [ChatMessageResponse(**m) for m in messages]

@api_router.post("/ratings/create", response_model=RatingResponse)
async def create_rating(data: RatingCreate, payload: dict = Depends(verify_token)):
    rating_dict = {
        "id": str(uuid.uuid4()),
        "service_id": data.service_id,
        "from_user_id": payload['user_id'],
        "to_user_id": data.to_user_id,
        "rating": data.rating,
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ratings.insert_one(rating_dict)
    
    ratings = await db.ratings.find({"to_user_id": data.to_user_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in ratings) / len(ratings) if ratings else 5.0
    await db.users.update_one({"id": data.to_user_id}, {"$set": {"reputation_score": avg_rating}})
    
    return RatingResponse(**rating_dict)

@api_router.get("/admin/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(payload: dict = Depends(verify_token)):
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    total_services = await db.services.count_documents({})
    active_services = await db.services.count_documents({"status": {"$in": ["accepted", "on_way", "picked_up", "in_transit"]}})
    total_users = await db.users.count_documents({"role": "client"})
    total_drivers = await db.users.count_documents({"role": "driver"})
    
    services = await db.services.find({"final_price": {"$exists": True}}, {"_id": 0}).to_list(10000)
    total_revenue = sum(s.get('final_price', 0) for s in services)
    commission = await db.commission_config.find_one({}, {"_id": 0})
    commission_rate = commission.get('default_rate', 0.15) if commission else 0.15
    total_commission = total_revenue * commission_rate
    
    return AdminDashboard(
        total_services=total_services,
        active_services=active_services,
        total_users=total_users,
        total_drivers=total_drivers,
        total_revenue=total_revenue,
        total_commission=total_commission
    )

@api_router.get("/admin/users", response_model=list[UserResponse])
async def get_all_users(payload: dict = Depends(verify_token)):
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    users = await db.users.find({}, {"_id": 0, "password": 0, "otp_code": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.post("/admin/users/{user_id}/block", response_model=dict)
async def block_user(user_id: str, payload: dict = Depends(verify_token)):
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await db.users.update_one({"id": user_id}, {"$set": {"status": "blocked"}})
    return {"message": "Usuario bloqueado"}

@api_router.get("/admin/commission-config", response_model=CommissionConfig)
async def get_commission_config(payload: dict = Depends(verify_token)):
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    config = await db.commission_config.find_one({}, {"_id": 0})
    if not config:
        default_config = {
            "id": str(uuid.uuid4()),
            "default_rate": 0.15,
            "vehicle_rates": {},
            "zone_rates": {}
        }
        await db.commission_config.insert_one(default_config)
        return CommissionConfig(**default_config)
    
    return CommissionConfig(**config)

@api_router.post("/admin/commission-config", response_model=dict)
async def update_commission_config(data: CommissionConfig, payload: dict = Depends(verify_token)):
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await db.commission_config.update_one(
        {},
        {"$set": data.model_dump()},
        upsert=True
    )
    return {"message": "Configuración actualizada"}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get('room')
    await sio.enter_room(sid, room)
    print(f"Client {sid} joined room {room}")

@sio.event
async def leave_room(sid, data):
    room = data.get('room')
    await sio.leave_room(sid, room)
    print(f"Client {sid} left room {room}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

socket_app = socketio.ASGIApp(sio, app)