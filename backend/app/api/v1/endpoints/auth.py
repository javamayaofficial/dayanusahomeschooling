import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.dependencies.auth import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import (AccessToken, AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, TokenPair, UserOut)
from app.services.auth_service import authenticate_user, get_user_by_id, register_user
router = APIRouter()
def _tk(u): return TokenPair(access_token=create_access_token(str(u.id), role=u.role.value), refresh_token=create_refresh_token(str(u.id)))
@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try: u=await register_user(db, data)
    except ValueError as e: raise HTTPException(409, str(e))
    return AuthResponse(user=UserOut.model_validate(u), tokens=_tk(u))
@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    u=await authenticate_user(db, data.email, data.password)
    if not u: raise HTTPException(401,"Email atau kata sandi salah.")
    return AuthResponse(user=UserOut.model_validate(u), tokens=_tk(u))
@router.post("/refresh-token", response_model=AccessToken)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    p=decode_token(data.refresh_token)
    if not p or p.get("type")!="refresh": raise HTTPException(401,"Refresh token tidak valid.")
    u=await get_user_by_id(db, uuid.UUID(p["sub"]))
    if not u or not u.is_active: raise HTTPException(401,"Pengguna tidak valid.")
    return AccessToken(access_token=create_access_token(str(u.id), role=u.role.value))
@router.get("/me", response_model=UserOut)
async def me(current: User = Depends(get_current_user)): return current
