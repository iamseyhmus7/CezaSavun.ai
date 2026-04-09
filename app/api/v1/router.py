from fastapi import APIRouter
from app.api.v1.endpoints import petitions, auth

api_router = APIRouter()
api_router.include_router(petitions.router, prefix="/petitions", tags=["petitions"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
