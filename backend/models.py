from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime
import uuid

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class OTPVerify(BaseModel):
    otp_code: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    verified: bool
    reputation_score: float
    status: str
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

class DriverRegister(BaseModel):
    vehicle_type: str
    vehicle_brand: str
    vehicle_model: str
    vehicle_plate: str
    license_number: str
    insurance_info: Optional[str] = None
    driver_photo_url: Optional[str] = None
    vehicle_registration_photo_url: str  # Tarjeta de propiedad (obligatoria)
    vehicle_photo_url: Optional[str] = None  # Foto de la grúa (opcional)

class WalletTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    driver_id: str
    amount: float
    transaction_type: str  # "commission", "recharge", "bonus"
    description: str
    balance_after: float
    created_at: str

class WalletRecharge(BaseModel):
    driver_id: str
    amount: float
    notes: Optional[str] = None

class DriverAvailabilityUpdate(BaseModel):
    available: bool
    current_location: Optional[Dict[str, float]] = None

class ServiceCreate(BaseModel):
    vehicle_type: str
    vehicle_brand: str
    vehicle_model: str
    vehicle_condition: str
    pickup_location: Dict[str, float]
    destination_location: Dict[str, float]
    pickup_address: Optional[str] = None
    destination_address: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = []
    suggested_price: Optional[float] = None  # Precio sugerido por el cliente (opcional)

class ServiceResponse(BaseModel):
    id: str
    client_id: str
    vehicle_type: str
    vehicle_brand: str
    vehicle_model: str
    vehicle_condition: str
    pickup_location: Dict[str, float]
    destination_location: Dict[str, float]
    pickup_address: Optional[str] = None
    destination_address: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = []
    status: str
    driver_id: Optional[str] = None
    final_price: Optional[float] = None
    suggested_price: Optional[float] = None  # Precio sugerido por el cliente
    distance_to_driver: Optional[float] = None
    created_at: str
    updated_at: str

class ServiceStatusUpdate(BaseModel):
    status: str

class OfferCreate(BaseModel):
    service_id: str
    price: float
    message: Optional[str] = None

class OfferResponse(BaseModel):
    id: str
    service_id: str
    driver_id: str
    price: float
    message: Optional[str] = None
    status: str
    created_at: str

class ChatMessageCreate(BaseModel):
    service_id: str
    message: Optional[str] = None
    message_type: str = "text"
    location: Optional[Dict[str, float]] = None

class ChatMessageResponse(BaseModel):
    id: str
    service_id: str
    sender_id: str
    message: Optional[str] = None
    message_type: str
    location: Optional[Dict[str, float]] = None
    created_at: str

class RatingCreate(BaseModel):
    service_id: str
    to_user_id: str
    rating: float
    comment: Optional[str] = None

class RatingResponse(BaseModel):
    id: str
    service_id: str
    from_user_id: str
    to_user_id: str
    rating: float
    comment: Optional[str] = None
    created_at: str

class TipCreate(BaseModel):
    service_id: str
    driver_id: str
    amount: float
    message: Optional[str] = None

class TipResponse(BaseModel):
    id: str
    service_id: str
    client_id: str
    driver_id: str
    amount: float
    message: Optional[str] = None
    created_at: str

class AdminDashboard(BaseModel):
    total_services: int
    active_services: int
    total_users: int
    total_drivers: int
    total_revenue: float
    total_commission: float

class CommissionConfig(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    default_rate: float
    vehicle_rates: Optional[Dict[str, float]] = {}
    zone_rates: Optional[Dict[str, float]] = {}

class LocationUpdate(BaseModel):
    service_id: str
    location: Dict[str, float]