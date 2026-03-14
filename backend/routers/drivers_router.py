"""
Router de conductores - Registro, disponibilidad, ubicación, billetera
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import DriverRegister, DriverAvailabilityUpdate, LocationUpdate
from cloudinary_helper import upload_driver_photos
from websocket_manager import sio
from utils import calculate_distance
from config import INITIAL_DRIVER_BALANCE, LOW_BALANCE_THRESHOLD

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("/register", response_model=dict)
async def register_driver(data: DriverRegister, payload: dict = Depends(verify_token)):
    """Registra información del vehículo y documentos del conductor"""
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores pueden registrar vehículos")
    
    driver_dict = data.model_dump()
    driver_dict = await upload_driver_photos(driver_dict)
    
    driver_dict.update({
        "id": str(uuid.uuid4()),
        "user_id": payload['user_id'],
        "verified": False,
        "available": False,
        "wallet_balance": INITIAL_DRIVER_BALANCE,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.drivers.insert_one(driver_dict)
    
    # Crear transacción de bono inicial
    transaction = {
        "id": str(uuid.uuid4()),
        "driver_id": payload['user_id'],
        "amount": INITIAL_DRIVER_BALANCE,
        "transaction_type": "bonus",
        "description": "Bono de bienvenida GruaApp",
        "balance_after": INITIAL_DRIVER_BALANCE,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallet_transactions.insert_one(transaction)
    
    return {
        "message": f"Información de conductor registrada. Has recibido ${INITIAL_DRIVER_BALANCE:,.0f} COP de bono de bienvenida.",
        "wallet_balance": INITIAL_DRIVER_BALANCE
    }

@router.post("/availability", response_model=dict)
async def update_driver_availability(data: DriverAvailabilityUpdate, payload: dict = Depends(verify_token)):
    """Actualiza disponibilidad del conductor"""
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

@router.get("/available", response_model=list)
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

@router.post("/location", response_model=dict)
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

@router.get("/wallet", response_model=dict)
async def get_driver_wallet(payload: dict = Depends(verify_token)):
    """Obtiene saldo y transacciones del conductor"""
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    driver = await db.drivers.find_one({"user_id": payload['user_id']}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Conductor no encontrado")
    
    transactions = await db.wallet_transactions.find(
        {"driver_id": payload['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    balance = driver.get('wallet_balance', 0)
    needs_recharge = balance < LOW_BALANCE_THRESHOLD
    
    nequi_info = {
        "phone": "3025159176",
        "message": f"Recarga GruaApp - Placa {driver.get('vehicle_plate', 'N/A')}"
    }
    
    return {
        "balance": balance,
        "needs_recharge": needs_recharge,
        "low_balance_warning": balance < LOW_BALANCE_THRESHOLD,
        "transactions": transactions,
        "nequi_recharge_info": nequi_info,
        "driver_info": {
            "vehicle_plate": driver.get('vehicle_plate'),
            "vehicle_type": driver.get('vehicle_type'),
            "vehicle_brand": driver.get('vehicle_brand'),
            "vehicle_model": driver.get('vehicle_model'),
            "verified": driver.get('verified', False)
        }
    }
