"""
Router de chat - Mensajes en tiempo real
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import ChatMessageCreate, ChatMessageResponse
from websocket_manager import sio

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/send", response_model=ChatMessageResponse)
async def send_message(data: ChatMessageCreate, payload: dict = Depends(verify_token)):
    """Envía un mensaje de chat"""
    message_dict = {
        "id": str(uuid.uuid4()),
        "service_id": data.service_id,
        "sender_id": payload['user_id'],
        "message": data.message,
        "message_type": data.message_type,
        "location": data.location,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_messages.insert_one(message_dict)
    await sio.emit('new_message', message_dict, room=f'service_{data.service_id}')
    
    return ChatMessageResponse(**message_dict)

@router.get("/{service_id}", response_model=list[ChatMessageResponse])
async def get_chat_messages(service_id: str, payload: dict = Depends(verify_token)):
    """Obtiene todos los mensajes de un servicio"""
    messages = await db.chat_messages.find({"service_id": service_id}, {"_id": 0}).to_list(1000)
    return [ChatMessageResponse(**m) for m in messages]
