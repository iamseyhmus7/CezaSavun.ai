# app/api/v1/endpoints/config.py  ← YENİ DOSYA
from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/config")
async def get_public_config():
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID
    }