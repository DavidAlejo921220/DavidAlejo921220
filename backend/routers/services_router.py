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
from utils import calculate_distance

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
    
    await sio.emit('status_updated', {"service_id": service_id, "status": data.status}, room=f'service_{service_id}')
    
    return {"message": "Estado actualizado"}
