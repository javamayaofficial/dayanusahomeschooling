import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.dependencies.auth import get_current_user, require_roles
from app.core.database import get_db
from app.models.enums import PaketLevel, UserRole
from app.models.user import User
from app.schemas.academic import LessonCreate, LessonOut, ModuleCreate, ModuleDetail, ModuleOut, ModuleUpdate
from app.services import module_service
router = APIRouter()
admin_only = require_roles(UserRole.ADMIN_PKBM, UserRole.ADMIN_YAYASAN)
@router.get("", response_model=list[ModuleOut])
async def list_modules(paket: PaketLevel|None=Query(None), db: AsyncSession=Depends(get_db), _: User=Depends(get_current_user)):
    return await module_service.list_modules(db, paket=paket)
@router.get("/{module_id}", response_model=ModuleDetail)
async def get_module(module_id: uuid.UUID, db: AsyncSession=Depends(get_db), _: User=Depends(get_current_user)):
    m=await module_service.get_module(db, module_id)
    if not m: raise HTTPException(404,"Modul tidak ditemukan.")
    return m
@router.post("", response_model=ModuleDetail, status_code=201)
async def create_module(data: ModuleCreate, db: AsyncSession=Depends(get_db), _: User=Depends(admin_only)):
    return await module_service.create_module(db, data)
@router.put("/{module_id}", response_model=ModuleDetail)
async def update_module(module_id: uuid.UUID, data: ModuleUpdate, db: AsyncSession=Depends(get_db), _: User=Depends(admin_only)):
    m=await module_service.get_module(db, module_id)
    if not m: raise HTTPException(404,"Modul tidak ditemukan.")
    return await module_service.update_module(db, m, data)
@router.post("/{module_id}/lessons", response_model=LessonOut, status_code=201)
async def add_lesson(module_id: uuid.UUID, data: LessonCreate, db: AsyncSession=Depends(get_db), _: User=Depends(admin_only)):
    m=await module_service.get_module(db, module_id)
    if not m: raise HTTPException(404,"Modul tidak ditemukan.")
    return await module_service.add_lesson(db, module_id, data)
