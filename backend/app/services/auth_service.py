from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import StudentProfile, User
from app.schemas.auth import RegisterRequest
async def get_user_by_email(db, email):
    r=await db.execute(select(User).where(User.email==email)); return r.scalar_one_or_none()
async def get_user_by_id(db, uid): return await db.get(User, uid)
async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    if await get_user_by_email(db, data.email): raise ValueError("Email sudah terdaftar.")
    u=User(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name, role=data.role, phone=data.phone, birth_date=data.birth_date)
    db.add(u); await db.flush()
    if data.role==UserRole.SISWA:
        db.add(StudentProfile(user_id=u.id, paket=data.paket, track=data.track, enrollment_date=date.today()))
    await db.flush(); await db.refresh(u); return u
async def authenticate_user(db, email, password):
    u=await get_user_by_email(db, email); return u if (u and verify_password(password, u.password_hash)) else None
async def get_student_profile(db, user_id):
    r=await db.execute(select(StudentProfile).where(StudentProfile.user_id==user_id)); return r.scalar_one_or_none()
