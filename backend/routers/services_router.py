"""
Router de servicios - Crear, listar, actualizar estado
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import ServiceCreate, ServiceResponse, ServiceStatusUpdate
from websocket_manager import sio
from utils import calculate_distance, notify_client_status_change, notify_driver_new_service

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/create", response_model=ServiceResponse)
async def create_service(data: ServiceCreate, payload: dict = Depends(verify_token)):
    """Crea una nueva solicitud de servicio de grúa"""
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
    
    # Notificar por email a TODOS los conductores disponibles
    drivers = await db.drivers.find({"available": True}, {"_id": 0, "user_id": 1}).to_list(100)
    for driver in drivers:
        driver_user = await db.users.find_one({"id": driver['user_id']}, {"_id": 0, "email": 1})
        if driver_user and driver_user.get('email'):
            await notify_driver_new_service(
                driver_user['email'],
                service_dict.get('vehicle_type', 'Vehículo'),
                service_dict.get('pickup_address', 'Ver en la app')
            )
    
    return ServiceResponse(**service_dict)

@router.get("/available", response_model=list[ServiceResponse])
async def get_available_services(payload: dict = Depends(verify_token)):
    """Obtiene servicios disponibles para conductores, ordenados por proximidad"""
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

@router.get("/my-services", response_model=list[ServiceResponse])
async def get_my_services(payload: dict = Depends(verify_token)):
    """Obtiene servicios del usuario actual (cliente o conductor)"""
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

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str, payload: dict = Depends(verify_token)):
    """Obtiene un servicio específico por ID"""
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return ServiceResponse(**service)


# === FUNCIONES AUXILIARES PARA COMISIONES ===

async def _process_driver_referral_bonus(driver_id: str, final_price: float):
    """Procesa el bono de referido para conductores (solo primer servicio)"""
    if not driver_id or final_price <= 0:
        return
    
    completed_count = await db.services.count_documents({
        "driver_id": driver_id,
        "status": "completed"
    })
    
    if completed_count != 1:
        return
    
    driver_user = await db.users.find_one({"id": driver_id}, {"_id": 0, "referido_asociado": 1})
    if not driver_user or not driver_user.get('referido_asociado'):
        return
    
    referrer_code = driver_user['referido_asociado']
    referrer = await db.users.find_one(
        {"$or": [{"codigo_referido": referrer_code}, {"referral_code": referrer_code}]},
        {"_id": 0, "id": 1, "full_name": 1}
    )
    
    if not referrer:
        return
    
    referrer_driver = await db.drivers.find_one(
        {"user_id": referrer['id']},
        {"_id": 0, "wallet_balance": 1}
    )
    
    if not referrer_driver:
        return
    
    commission = final_price * 0.05
    new_wallet = referrer_driver.get('wallet_balance', 0) + commission
    
    await db.drivers.update_one(
        {"user_id": referrer['id']},
        {"$set": {"wallet_balance": new_wallet}}
    )
    
    await sio.emit('driver_referral_bonus', {
        "amount": commission,
        "new_wallet_balance": new_wallet,
        "message": f"¡Bono por referido! +${commission:,.0f} COP a tu saldo operativo"
    }, room=f"user_{referrer['id']}")


async def _process_client_referral_commission(service: dict, final_price: float):
    """Procesa cashback o comisión para clientes"""
    referral_code = service.get('referral_code_used')
    if not referral_code or final_price <= 0:
        return
    
    client_id = service.get('client_id')
    code_owner = await db.users.find_one(
        {"$or": [{"codigo_referido": referral_code}, {"referral_code": referral_code}]},
        {"_id": 0, "id": 1, "monedero_comisiones": 1, "commission_balance": 1, "full_name": 1}
    )
    
    if not code_owner:
        return
    
    commission = final_price * 0.05
    current_balance = code_owner.get('monedero_comisiones') or code_owner.get('commission_balance', 0)
    new_balance = current_balance + commission
    is_cashback = code_owner['id'] == client_id
    
    await db.users.update_one(
        {"id": code_owner['id']},
        {"$set": {"monedero_comisiones": new_balance, "commission_balance": new_balance}}
    )
    
    if not is_cashback:
        await db.users.update_one(
            {"id": code_owner['id']},
            {"$inc": {"total_referrals": 1}}
        )
    
    message = f"¡Cashback! Ganaste ${commission:,.0f} COP" if is_cashback else f"¡Comisión por referido! Ganaste ${commission:,.0f} COP"
    
    await sio.emit('referral_commission', {
        "amount": commission,
        "new_balance": new_balance,
        "is_cashback": is_cashback,
        "message": message
    }, room=f"user_{code_owner['id']}")


@router.post("/{service_id}/update-status", response_model=dict)
async def update_service_status(service_id: str, data: ServiceStatusUpdate, payload: dict = Depends(verify_token)):
    """Actualiza el estado de un servicio"""
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Procesar comisiones al completar servicio
    if data.status == "completed":
        final_price = service.get('final_price', 0)
        await _process_driver_referral_bonus(service.get('driver_id'), final_price)
        await _process_client_referral_commission(service, final_price)
    
    await sio.emit('status_updated', {"service_id": service_id, "status": data.status}, room=f'service_{service_id}')
    
    # Enviar email al cliente sobre el cambio de estado
    client = await db.users.find_one({"id": service['client_id']}, {"_id": 0, "email": 1})
    driver = await db.users.find_one({"id": service.get('driver_id')}, {"_id": 0, "full_name": 1}) if service.get('driver_id') else None
    driver_name = driver.get('full_name') if driver else None
    
    if client and client.get('email'):
        await notify_client_status_change(client['email'], data.status, driver_name)
    
    return {"message": "Estado actualizado"}



@router.delete("/{service_id}", response_model=dict)
async def cancel_service(service_id: str, payload: dict = Depends(verify_token)):
    """Cliente cancela servicio (solo antes de aceptar oferta) o Admin elimina"""
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    # Admin puede eliminar cualquier servicio no completado
    if payload['role'] == 'admin':
        if service['status'] == 'completed':
            raise HTTPException(status_code=400, detail="No se puede eliminar un servicio completado")
        await db.services.delete_one({"id": service_id})
        await db.offers.delete_many({"service_id": service_id})
        return {"message": "Servicio eliminado por administrador"}
    
    # Cliente solo puede cancelar si es suyo y no ha sido aceptado
    if service['client_id'] != payload['user_id']:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    if service['status'] in ['accepted', 'in_progress', 'picked_up', 'completed']:
        raise HTTPException(status_code=400, detail="No puedes cancelar un servicio que ya fue aceptado")
    
    await db.services.update_one({"id": service_id}, {"$set": {"status": "cancelled"}})
    await db.offers.update_many({"service_id": service_id}, {"$set": {"status": "cancelled"}})
    
    return {"message": "Servicio cancelado"}
