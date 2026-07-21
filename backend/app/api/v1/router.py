from fastapi import APIRouter
from app.api.v1.endpoints import auth, modules, learning, assignments, portfolios, chat
from app.core.config import settings
api_router = APIRouter()
@api_router.get("/info", tags=["health"])
async def info(): return {"app": settings.APP_NAME, "env": settings.APP_ENV, "version": "1.4.0-guru-ai", "ai_enabled": settings.ai_enabled}
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(learning.router)
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
