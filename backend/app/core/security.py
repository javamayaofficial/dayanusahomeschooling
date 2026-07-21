from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(p): return pwd_context.hash(p)
def verify_password(p,h): return pwd_context.verify(p,h)
def _t(sub,delta,tt,extra=None):
    now=datetime.now(timezone.utc); pl={"sub":sub,"type":tt,"iat":now,"exp":now+delta}
    if extra: pl.update(extra)
    return jwt.encode(pl, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
def create_access_token(sub,role=None): return _t(sub,timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),"access",{"role":role} if role else None)
def create_refresh_token(sub): return _t(sub,timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),"refresh")
def decode_token(t):
    try: return jwt.decode(t, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError: return None
