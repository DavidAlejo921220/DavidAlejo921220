"""
Router de calificaciones - Ratings bidireccionales
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from auth import verify_token
from models import RatingCreate, RatingResponse

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
