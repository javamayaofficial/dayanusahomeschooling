import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth_service import get_user_by_id
bearer_scheme = HTTPBearer(auto_error=True)
optional_bearer = HTTPBearer(auto_error=False)
async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: AsyncSession = Depends(get_db)) -> User:
    p=decode_token(cred.credentials)
    if not p or p.get("type")!="access": raise HTTPException(401,"Token tidak valid atau kedaluwarsa.")
    try: uid=uuid.UUID(p["sub"])
    except (KeyError,ValueError): raise HTTPException(401,"Token tidak valid.")
    u=await get_user_by_id(db, uid)
    if not u or not u.is_active: raise HTTPException(401,"Pengguna tidak ditemukan atau non-aktif.")
    return u
async def get_optional_user(cred: HTTPAuthorizationCredentials = Depends(optional_bearer), db: AsyncSession = Depends(get_db)) -> User | None:
    if not cred: return None
    p=decode_token(cred.credentials)
    if not p or p.get("type")!="access": return None
    try: uid=uuid.UUID(p["sub"])
    except (KeyError,ValueError): return None
    return await get_user_by_id(db, uid)
def require_roles(*roles: UserRole):
    async def checker(current: User = Depends(get_current_user)) -> User:
        if current.role not in roles: raise HTTPException(403,"Anda tidak memiliki akses ke sumber daya ini.")
        return current
    return checker
