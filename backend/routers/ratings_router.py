"""
Router de calificaciones y propinas
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import RatingCreate, RatingResponse, TipCreate, TipResponse
from websocket_manager import sio

router = APIRouter(prefix="/ratings", tags=["Ratings"])

@router.post("/create", response_model=RatingResponse)
async def create_rating(data: RatingCreate, payload: dict = Depends(verify_token)):
    """Crea una calificación para un usuario"""
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
    
    # Actualizar promedio de reputación
    ratings = await db.ratings.find({"to_user_id": data.to_user_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in ratings) / len(ratings) if ratings else 5.0
    await db.users.update_one({"id": data.to_user_id}, {"$set": {"reputation_score": avg_rating}})
    
    return RatingResponse(**rating_dict)

@router.get("/user/{user_id}", response_model=list[RatingResponse])
async def get_user_ratings(user_id: str, payload: dict = Depends(verify_token)):
    """Obtiene todas las calificaciones de un usuario"""
    ratings = await db.ratings.find({"to_user_id": user_id}, {"_id": 0}).to_list(100)
    return [RatingResponse(**r) for r in ratings]

@router.get("/service/{service_id}/check")
async def check_rating_exists(service_id: str, payload: dict = Depends(verify_token)):
    """Verifica si el usuario ya calificó este servicio"""
    existing = await db.ratings.find_one({
        "service_id": service_id,
        "from_user_id": payload['user_id']
    })
    return {"rated": existing is not None}

# === PROPINAS ===

@router.post("/tip", response_model=TipResponse)
async def send_tip(data: TipCreate, payload: dict = Depends(verify_token)):
    """Envía una propina al conductor"""
    if payload['role'] != 'client':
        raise HTTPException(status_code=403, detail="Solo clientes pueden enviar propinas")
    
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")
    
    tip_dict = {
        "id": str(uuid.uuid4()),
        "service_id": data.service_id,
        "client_id": payload['user_id'],
        "driver_id": data.driver_id,
        "amount": data.amount,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tips.insert_one(tip_dict)
    
    # Agregar la propina al saldo del conductor
    driver = await db.drivers.find_one({"user_id": data.driver_id})
    if driver:
        new_balance = driver.get('wallet_balance', 0) + data.amount
        await db.drivers.update_one(
            {"user_id": data.driver_id},
            {"$set": {"wallet_balance": new_balance}}
        )
        
        # Notificar al conductor
        await sio.emit('tip_received', {
            "amount": data.amount,
            "message": data.message,
            "new_balance": new_balance
        }, room=f'driver_{data.driver_id}')
    
    return TipResponse(**tip_dict)

@router.get("/tips/service/{service_id}")
async def get_service_tip(service_id: str, payload: dict = Depends(verify_token)):
    """Obtiene la propina de un servicio"""
    tip = await db.tips.find_one({"service_id": service_id}, {"_id": 0})
    if tip:
        return TipResponse(**tip)
    return None
