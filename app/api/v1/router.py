from fastapi import APIRouter
from app.api.v1.endpoints import petitions

api_router = APIRouter()
api_router.include_router(petitions.router, prefix="/petitions", tags=["petitions"])
