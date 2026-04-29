"""
Router para sistema de referidos y monedero de comisiones
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid
import random
import string

from database import db
from auth import verify_token
from models import WithdrawalRequest, WithdrawalResponse, WalletInfo
from websocket_manager import sio

router = APIRouter(prefix="/referrals", tags=["Referrals"])

def generate_referral_code():
    """Genera un código de referido único de 4 caracteres alfanuméricos"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

@router.get("/wallet")
async def get_wallet_info(payload: dict = Depends(verify_token)):
    """Obtiene la información del monedero de comisiones del usuario"""
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Compatibilidad: usar codigo_referido o referral_code
    referral_code = user.get('codigo_referido') or user.get('referral_code')
    
    # Si no tiene código de referido, generarlo y guardarlo
    if not referral_code:
        referral_code = generate_referral_code()
        # Asegurar que sea único
        while await db.users.find_one({"$or": [{"codigo_referido": referral_code}, {"referral_code": referral_code}]}):
            referral_code = generate_referral_code()
        
        await db.users.update_one(
            {"id": payload['user_id']},
            {"$set": {
                "codigo_referido": referral_code, 
                "referral_code": referral_code,
                "monedero_comisiones": 0,
                "commission_balance": 0
            }}
        )
    
    # Contar referidos (servicios que usaron su código)
    total_referrals = await db.services.count_documents({
        "referral_code_used": referral_code
    })
    
    # Verificar si tiene solicitud de retiro pendiente
    pending_withdrawal = await db.withdrawals.find_one({
        "user_id": payload['user_id'],
        "status": "pendiente"
    }, {"_id": 0})
    
    # Obtener info del código de referido asociado (quien lo refirió)
    associated_code = user.get('referido_asociado')
    associated_owner = None
    if associated_code:
        referrer = await db.users.find_one(
            {"$or": [{"codigo_referido": associated_code}, {"referral_code": associated_code}]}, 
            {"_id": 0, "full_name": 1}
        )
        if referrer:
            associated_owner = referrer.get('full_name', 'Usuario')
    
    # Balance: usar el que tenga valor
    balance = user.get('monedero_comisiones') or user.get('commission_balance', 0)
    
    return {
        "referral_code": referral_code,
        "commission_balance": balance,
        "total_referrals": total_referrals,
        "pending_withdrawal": pending_withdrawal,
        "associated_referral_code": associated_code,
        "associated_referral_owner": associated_owner
    }

@router.post("/withdraw", response_model=WithdrawalResponse)
async def request_withdrawal(data: WithdrawalRequest, payload: dict = Depends(verify_token)):
    """Solicita un retiro de comisiones al monedero Nequi"""
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    balance = user.get('commission_balance', 0)
    
    if balance <= 0:
        raise HTTPException(status_code=400, detail="No tienes saldo disponible para retirar")
    
    # Verificar si ya tiene una solicitud pendiente
    existing = await db.withdrawals.find_one({
        "user_id": payload['user_id'],
        "status": "pendiente"
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud de retiro pendiente")
    
    # Validar número Nequi (10 dígitos)
    if not data.nequi_number.isdigit() or len(data.nequi_number) != 10:
        raise HTTPException(status_code=400, detail="El número Nequi debe tener 10 dígitos")
    
    withdrawal = {
        "id": str(uuid.uuid4()),
        "user_id": payload['user_id'],
        "user_name": user.get('full_name', ''),
        "user_email": user.get('email', ''),
        "amount": balance,
        "nequi_number": data.nequi_number,
        "status": "pendiente",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.withdrawals.insert_one(withdrawal)
    
    # Notificar al admin
    await sio.emit('new_withdrawal_request', {
        "id": withdrawal['id'],
        "user_name": user.get('full_name'),
        "amount": balance,
        "nequi_number": data.nequi_number
    }, room='admin_room')
    
    return WithdrawalResponse(**withdrawal)

@router.get("/my-code")
async def get_my_referral_code(payload: dict = Depends(verify_token)):
    """Obtiene solo el código de referido del usuario"""
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0, "referral_code": 1})
    
    if not user or not user.get('referral_code'):
        # Generar código si no existe
        referral_code = generate_referral_code()
        while await db.users.find_one({"referral_code": referral_code}):
            referral_code = generate_referral_code()
        
        await db.users.update_one(
            {"id": payload['user_id']},
            {"$set": {"referral_code": referral_code, "commission_balance": 0}}
        )
        return {"referral_code": referral_code}
    
    return {"referral_code": user.get('referral_code')}

@router.get("/validate/{code}")
async def validate_referral_code(code: str, payload: dict = Depends(verify_token)):
    """Valida si un código de referido existe y es válido"""
    code = code.upper()
    
    # Verificar si es su propio código (válido para CASHBACK)
    current_user = await db.users.find_one({"id": payload['user_id']}, {"codigo_referido": 1, "referral_code": 1, "full_name": 1})
    user_code = current_user.get('codigo_referido') or current_user.get('referral_code') if current_user else None
    
    if user_code and user_code == code:
        # Es su propio código - válido para cashback
        return {"valid": True, "owner_name": "Tú (Cashback 5%)", "is_own_code": True}
    
    # Buscar el dueño del código (buscar en ambos campos por compatibilidad)
    owner = await db.users.find_one(
        {"$or": [{"codigo_referido": code}, {"referral_code": code}]}, 
        {"_id": 0, "full_name": 1}
    )
    
    if owner:
        return {"valid": True, "owner_name": owner.get('full_name', 'Usuario'), "is_own_code": False}
    
    return {"valid": False, "message": "Código no encontrado"}


@router.post("/associate")
async def associate_referral_code(data: dict, payload: dict = Depends(verify_token)):
    """Asocia un código de referido al usuario actual (para conductores al registrarse)"""
    code = data.get('referral_code', '').upper()
    
    if not code or len(code) < 4:
        raise HTTPException(status_code=400, detail="Código inválido")
    
    # Verificar que el usuario no tenga ya un código asociado
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0, "referido_asociado": 1})
    if user and user.get('referido_asociado'):
        raise HTTPException(status_code=400, detail="Ya tienes un código de referido asociado")
    
    # Verificar que el código existe
    owner = await db.users.find_one(
        {"$or": [{"codigo_referido": code}, {"referral_code": code}]},
        {"_id": 0, "id": 1}
    )
    
    if not owner:
        raise HTTPException(status_code=404, detail="Código no encontrado")
    
    # No puede asociar su propio código
    if owner['id'] == payload['user_id']:
        raise HTTPException(status_code=400, detail="No puedes usar tu propio código")
    
    # Asociar el código
    await db.users.update_one(
        {"id": payload['user_id']},
        {"$set": {"referido_asociado": code}}
    )
    
    return {"message": "Código asociado exitosamente", "referral_code": code}


# ============ ADMIN ENDPOINTS ============

@router.get("/admin/withdrawals", response_model=list[WithdrawalResponse])
async def get_pending_withdrawals(payload: dict = Depends(verify_token)):
    """Lista todas las solicitudes de retiro pendientes (solo admin)"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver esto")
    
    withdrawals = await db.withdrawals.find(
        {"status": "pendiente"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [WithdrawalResponse(**w) for w in withdrawals]

@router.get("/admin/withdrawals/all", response_model=list[WithdrawalResponse])
async def get_all_withdrawals(payload: dict = Depends(verify_token)):
    """Lista todas las solicitudes de retiro (solo admin)"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver esto")
    
    withdrawals = await db.withdrawals.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [WithdrawalResponse(**w) for w in withdrawals]

@router.post("/admin/withdrawals/{withdrawal_id}/complete")
async def mark_withdrawal_complete(withdrawal_id: str, payload: dict = Depends(verify_token)):
    """Marca una solicitud de retiro como completada y resetea el monedero"""
    if payload['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden hacer esto")
    
    withdrawal = await db.withdrawals.find_one({"id": withdrawal_id}, {"_id": 0})
    
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if withdrawal['status'] == 'completado':
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue completada")
    
    # Actualizar estado de la solicitud
    await db.withdrawals.update_one(
        {"id": withdrawal_id},
        {"$set": {
            "status": "completado",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Resetear el monedero del usuario a 0
    await db.users.update_one(
        {"id": withdrawal['user_id']},
        {"$set": {"commission_balance": 0}}
    )
    
    # Notificar al usuario
    await sio.emit('withdrawal_completed', {
        "amount": withdrawal['amount'],
        "message": "Tu retiro ha sido procesado exitosamente"
    }, room=f"user_{withdrawal['user_id']}")
    
    return {
        "message": "Retiro marcado como completado",
        "withdrawal_id": withdrawal_id,
        "user_id": withdrawal['user_id'],
        "amount": withdrawal['amount']
    }
