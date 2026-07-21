import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.dependencies.auth import get_current_user, require_roles
from app.core.database import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.softskill import (DashboardSummary, ProgressOut, ProgressUpdate, SkillClassCreate, SkillClassDetail, SkillClassOut)
from app.services import skill_service
from app.services.auth_service import get_student_profile
router = APIRouter()
admin_only = require_roles(UserRole.ADMIN_PKBM, UserRole.ADMIN_YAYASAN)
student_only = require_roles(UserRole.SISWA)
@router.get("/soft-skills", response_model=list[SkillClassOut], tags=["soft-skills"])
async def list_ss(db: AsyncSession=Depends(get_db), _: User=Depends(get_current_user)):
    return await skill_service.list_classes(db)
@router.get("/soft-skills/{class_id}", response_model=SkillClassDetail, tags=["soft-skills"])
async def get_ss(class_id: uuid.UUID, db: AsyncSession=Depends(get_db), _: User=Depends(get_current_user)):
    o=await skill_service.get_class(db, class_id)
    if not o: raise HTTPException(404,"Kelas tidak ditemukan.")
    return o
@router.post("/soft-skills", response_model=SkillClassDetail, status_code=201, tags=["soft-skills"])
async def create_ss(data: SkillClassCreate, db: AsyncSession=Depends(get_db), _: User=Depends(admin_only)):
    return await skill_service.create_class(db, data)
async def _profile(current, db):
    p=await get_student_profile(db, current.id)
    if not p: raise HTTPException(404,"Profil siswa tidak ditemukan.")
    return p
@router.post("/progress", response_model=ProgressOut, tags=["progress"])
async def update_progress(data: ProgressUpdate, db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await _profile(current, db); return await skill_service.upsert_progress(db, p.id, data)
@router.get("/progress/me", response_model=list[ProgressOut], tags=["progress"])
async def my_progress(db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await _profile(current, db); return await skill_service.list_progress(db, p.id)
@router.get("/dashboard/summary", response_model=DashboardSummary, tags=["dashboard"])
async def dashboard(db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await _profile(current, db); return await skill_service.dashboard_summary(db, p.id, p.paket)
