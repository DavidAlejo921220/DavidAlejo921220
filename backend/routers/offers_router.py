"""
Router de ofertas - Crear, listar, aceptar/rechazar
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import OfferCreate, OfferResponse
from websocket_manager import sio
from config import DEFAULT_COMMISSION_RATE, LOW_BALANCE_THRESHOLD
from utils import notify_client_new_offer, notify_driver_offer_accepted

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.post("/create", response_model=OfferResponse)
async def create_offer(data: OfferCreate, payload: dict = Depends(verify_token)):
    """Conductor crea una oferta para un servicio"""
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    # Obtener info del conductor para el email
    driver = await db.users.find_one({"id": payload['user_id']}, {"_id": 0, "full_name": 1})
    driver_name = driver.get('full_name', 'Conductor') if driver else 'Conductor'
    
    # Obtener email del cliente
    client = await db.users.find_one({"id": service['client_id']}, {"_id": 0, "email": 1})
    
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
    
    # Enviar email al cliente
    if client and client.get('email'):
        await notify_client_new_offer(client['email'], driver_name, data.price, data.service_id)
    
    return OfferResponse(**offer_dict)

@router.get("/service/{service_id}", response_model=list[OfferResponse])
async def get_service_offers(service_id: str, payload: dict = Depends(verify_token)):
    """Obtiene todas las ofertas de un servicio"""
    offers = await db.offers.find({"service_id": service_id}, {"_id": 0}).to_list(100)
    return [OfferResponse(**o) for o in offers]

@router.post("/{offer_id}/accept", response_model=dict)
async def accept_offer(offer_id: str, payload: dict = Depends(verify_token)):
    """Cliente acepta una oferta. Deduce comisión del conductor."""
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    service = await db.services.find_one({"id": offer['service_id']}, {"_id": 0})
    if service['client_id'] != payload['user_id']:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Verificar saldo del conductor
    driver = await db.drivers.find_one({"user_id": offer['driver_id']}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Conductor no encontrado")
    
    # Calcular comisión
    commission_amount = offer['price'] * DEFAULT_COMMISSION_RATE
    current_balance = driver.get('wallet_balance', 0)
    
    # Verificar saldo suficiente
    if current_balance < commission_amount:
        raise HTTPException(
            status_code=402,
            detail=f"Saldo insuficiente. Se requiere ${commission_amount:,.0f} COP para esta oferta. Saldo actual: ${current_balance:,.0f} COP. Por favor recarga tu saldo."
        )
    
    new_balance = current_balance - commission_amount
    
    # Actualizar saldo del conductor
    await db.drivers.update_one(
        {"user_id": offer['driver_id']},
        {"$set": {"wallet_balance": new_balance}}
    )
    
    # Crear transacción de comisión
    transaction = {
        "id": str(uuid.uuid4()),
        "driver_id": offer['driver_id'],
        "amount": -commission_amount,
        "transaction_type": "commission",
        "description": f"Comisión {int(DEFAULT_COMMISSION_RATE*100)}% - Servicio {service.get('vehicle_brand', '')} {service.get('vehicle_model', '')}",
        "balance_after": new_balance,
        "service_id": offer['service_id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallet_transactions.insert_one(transaction)
    
    # Actualizar ofertas y servicio
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
    
    # Notificar al conductor sobre su nuevo saldo
    await sio.emit('wallet_updated', {
        "balance": new_balance,
        "needs_recharge": new_balance < LOW_BALANCE_THRESHOLD,
        "transaction": transaction
    }, room=f'driver_{offer["driver_id"]}')
    
    # Enviar email al conductor que su oferta fue aceptada
    driver = await db.users.find_one({"id": offer['driver_id']}, {"_id": 0, "email": 1})
    if driver and driver.get('email'):
        await notify_driver_offer_accepted(
            driver['email'], 
            offer['price'], 
            service.get('pickup_address', 'Ver en la app')
        )
    
    return {
        "message": "Oferta aceptada",
        "commission_charged": commission_amount,
        "driver_new_balance": new_balance
    }

@router.post("/{offer_id}/reject", response_model=dict)
async def reject_offer(offer_id: str, payload: dict = Depends(verify_token)):
    """Cliente rechaza una oferta"""
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    service = await db.services.find_one({"id": offer['service_id']}, {"_id": 0})
    if service['client_id'] != payload['user_id']:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    await db.offers.update_one({"id": offer_id}, {"$set": {"status": "rejected"}})
    
    await sio.emit('offer_rejected', {"offer_id": offer_id}, room=f'driver_{offer["driver_id"]}')
    
    return {"message": "Oferta rechazada"}
