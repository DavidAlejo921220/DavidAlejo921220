# Endpoints adicionales para agregar a server.py

from utils import calculate_distance

# Después del endpoint de /drivers/register, agregar:

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
    
    # Emit availability change via WebSocket
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
    
    # Obtener info del usuario para cada conductor
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
    
    # Actualizar ubicación en la colección de drivers
    await db.drivers.update_one(
        {"user_id": payload['user_id']},
        {"$set": {
            "current_location": data.location,
            "last_location_update": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Emitir ubicación a clientes que tienen servicio con este conductor
    await sio.emit('driver_location_update', {
        'service_id': data.service_id,
        'driver_id': payload['user_id'],
        'location': data.location
    }, room=f'service_{data.service_id}')
    
    # Calcular si está cerca del cliente (menos de 500 metros)
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if service and service.get('pickup_location'):
        distance = calculate_distance(
            data.location['lat'],
            data.location['lng'],
            service['pickup_location']['lat'],
            service['pickup_location']['lng']
        )
        
        # Si está a menos de 500 metros, notificar
        if distance < 0.5:  # 500 metros = 0.5 km
            await sio.emit('driver_nearby', {
                'service_id': data.service_id,
                'driver_id': payload['user_id'],
                'distance_meters': int(distance * 1000),
                'message': f'¡La grúa está a {int(distance * 1000)} metros de distancia!'
            }, room=f'service_{data.service_id}')
    
    return {"message": "Ubicación actualizada", "distance_km": distance if service else None}

# Modificar el endpoint /services/available para ordenar por cercanía:
@api_router.get("/services/available-sorted", response_model=list[ServiceResponse])
async def get_available_services_sorted(payload: dict = Depends(verify_token)):
    """Obtiene servicios ordenados por cercanía al conductor"""
    if payload['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Solo conductores")
    
    # Obtener ubicación actual del conductor
    driver = await db.drivers.find_one({"user_id": payload['user_id']}, {"_id": 0})
    
    if not driver or not driver.get('current_location'):
        # Si no tiene ubicación, devolver todos sin orden
        services = await db.services.find(
            {"status": {"$in": ["created", "negotiating"]}},
            {"_id": 0}
        ).to_list(100)
        return [ServiceResponse(**s) for s in services]
    
    driver_location = driver['current_location']
    services = await db.services.find(
        {"status": {"$in": ["created", "negotiating"]}},
        {"_id": 0}
    ).to_list(100)
    
    # Calcular distancia para cada servicio
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
    
    # Ordenar por distancia (más cercano primero)
    services_with_distance.sort(key=lambda x: x.get('distance_to_driver', float('inf')))
    
    return [ServiceResponse(**s) for s in services_with_distance]
