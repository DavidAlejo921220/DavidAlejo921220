"""
Router de autenticación - Registro, Login, OTP
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
import bcrypt
import uuid

from database import db
from auth import create_token, verify_token
from models import UserRegister, UserLogin, OTPVerify, AuthResponse, UserResponse
from utils import send_otp_email, generate_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
async def register(data: UserRegister):
    """Registra un nuevo usuario y envía OTP por email"""
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
        "verified": True,  # Auto-verificado (sin OTP)
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reputation_score": 5.0,
        "status": "active"
    }
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user_dict['id'], user_dict['role'])
    return AuthResponse(
        token=token,
        user=UserResponse(**{k: v for k, v in user_dict.items() if k != 'password'}),
        message="¡Cuenta creada exitosamente!"
    )

@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin):
    """Inicia sesión de usuario"""
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

@router.post("/verify-otp", response_model=dict)
async def verify_otp(data: OTPVerify, payload: dict = Depends(verify_token)):
    """Verifica el código OTP del usuario"""
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

@router.post("/resend-otp", response_model=dict)
async def resend_otp(payload: dict = Depends(verify_token)):
    """Reenvía código OTP al usuario"""
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


@router.get("/users/{user_id}", response_model=dict)
async def get_user_info(user_id: str, payload: dict = Depends(verify_token)):
    """Obtiene información básica de un usuario (para mostrar datos del cliente al conductor)"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "otp_code": 0, "otp_expiry": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {
        "id": user.get("id"),
        "full_name": user.get("full_name"),
        "phone": user.get("phone"),
        "reputation_score": user.get("reputation_score", 5.0)
    }
