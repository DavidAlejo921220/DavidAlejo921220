"""
Router de administración - Dashboard, usuarios, billeteras, comisiones
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import (
    UserResponse, AdminDashboard, CommissionConfig, WalletRecharge
)
from config import LOW_BALANCE_THRESHOLD

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(payload: dict = Depends(verify_token)):
    """Obtiene estadísticas del dashboard de administración"""
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

@router.get("/users", response_model=list[UserResponse])
async def get_all_users(payload: dict = Depends(verify_token)):
    """Obtiene lista de todos los usuarios"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    users = await db.users.find({}, {"_id": 0, "password": 0, "otp_code": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@router.post("/users/{user_id}/block", response_model=dict)
async def block_user(user_id: str, payload: dict = Depends(verify_token)):
    """Bloquea un usuario"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await db.users.update_one({"id": user_id}, {"$set": {"status": "blocked"}})
    return {"message": "Usuario bloqueado"}

@router.post("/users/{user_id}/unblock", response_model=dict)
async def unblock_user(user_id: str, payload: dict = Depends(verify_token)):
    """Desbloquea un usuario"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await db.users.update_one({"id": user_id}, {"$set": {"status": "active"}})
    return {"message": "Usuario desbloqueado"}

@router.get("/commission-config", response_model=CommissionConfig)
async def get_commission_config(payload: dict = Depends(verify_token)):
    """Obtiene configuración de comisiones"""
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

@router.post("/commission-config", response_model=dict)
async def update_commission_config(data: CommissionConfig, payload: dict = Depends(verify_token)):
    """Actualiza configuración de comisiones"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await db.commission_config.update_one(
        {},
        {"$set": data.model_dump()},
        upsert=True
    )
    return {"message": "Configuración actualizada"}

@router.post("/drivers/recharge", response_model=dict)
async def admin_recharge_wallet(data: WalletRecharge, payload: dict = Depends(verify_token)):
    """Admin recarga saldo de conductor manualmente"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    driver = await db.drivers.find_one({"user_id": data.driver_id}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Conductor no encontrado")
    
    current_balance = driver.get('wallet_balance', 0)
    new_balance = current_balance + data.amount
    
    await db.drivers.update_one(
        {"user_id": data.driver_id},
        {"$set": {"wallet_balance": new_balance}}
    )
    
    transaction = {
        "id": str(uuid.uuid4()),
        "driver_id": data.driver_id,
        "amount": data.amount,
        "transaction_type": "recharge",
        "description": f"Recarga manual por admin: {data.notes or 'Sin notas'}",
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallet_transactions.insert_one(transaction)
    
    user = await db.users.find_one({"id": data.driver_id}, {"_id": 0})
    
    return {
        "message": f"Recarga exitosa para {user.get('full_name', 'N/A')}",
        "driver_name": user.get('full_name'),
        "amount_recharged": data.amount,
        "previous_balance": current_balance,
        "new_balance": new_balance
    }

@router.get("/drivers/wallets", response_model=list)
async def admin_get_all_wallets(payload: dict = Depends(verify_token)):
    """Admin obtiene lista de todos los conductores con su saldo"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    drivers = await db.drivers.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for driver in drivers:
        user = await db.users.find_one({"id": driver['user_id']}, {"_id": 0, "password": 0})
        if user:
            result.append({
                "driver_id": driver['user_id'],
                "full_name": user['full_name'],
                "phone": user['phone'],
                "vehicle_plate": driver.get('vehicle_plate'),
                "vehicle_brand": driver.get('vehicle_brand'),
                "vehicle_model": driver.get('vehicle_model'),
                "wallet_balance": driver.get('wallet_balance', 0),
                "needs_recharge": driver.get('wallet_balance', 0) < LOW_BALANCE_THRESHOLD,
                "status": user.get('status')
            })
    
    result.sort(key=lambda x: x['wallet_balance'])
    
    return result
