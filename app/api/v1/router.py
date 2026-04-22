from fastapi import APIRouter
from app.api.v1.endpoints import petitions, auth, ws, notifications, admin

api_router = APIRouter()
api_router.include_router(petitions.router, prefix="/petitions", tags=["petitions"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
