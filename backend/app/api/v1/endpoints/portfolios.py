import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.dependencies.auth import get_current_user, require_roles
from app.core.database import get_db
from app.models.enums import ADMIN_ROLES, PortfolioCategory, UserRole
from app.models.user import User
from app.schemas.portfolio import (LikeResult, PortfolioCreate, PortfolioOut, PortfolioPage, PortfolioUpdate)
from app.services import portfolio_service
from app.services.auth_service import get_student_profile
router = APIRouter()
student_only = require_roles(UserRole.SISWA)
@router.get("", response_model=PortfolioPage)
async def list_public(category: PortfolioCategory|None=Query(None), limit: int=Query(12, ge=1, le=50), offset: int=Query(0, ge=0), db: AsyncSession=Depends(get_db)):
    items,total=await portfolio_service.list_public(db, category=category, limit=limit, offset=offset)
    return PortfolioPage(items=items, total=total, limit=limit, offset=offset)
@router.get("/me", response_model=list[PortfolioOut])
async def list_mine(db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await get_student_profile(db, current.id)
    if not p: raise HTTPException(404,"Profil siswa tidak ditemukan.")
    return await portfolio_service.list_mine(db, p.id)
@router.get("/{portfolio_id}", response_model=PortfolioOut)
async def get_detail(portfolio_id: uuid.UUID, db: AsyncSession=Depends(get_db)):
    p=await portfolio_service.get_portfolio(db, portfolio_id)
    if not p or not p.is_published: raise HTTPException(404,"Karya tidak ditemukan.")
    await portfolio_service.increment_views(db, p); return p
@router.post("", response_model=PortfolioOut, status_code=201)
async def create(data: PortfolioCreate, db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await get_student_profile(db, current.id)
    if not p: raise HTTPException(404,"Profil siswa tidak ditemukan.")
    return await portfolio_service.create_portfolio(db, p.id, data)
@router.put("/{portfolio_id}", response_model=PortfolioOut)
async def update(portfolio_id: uuid.UUID, data: PortfolioUpdate, db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    p=await portfolio_service.get_portfolio(db, portfolio_id)
    if not p: raise HTTPException(404,"Karya tidak ditemukan.")
    prof=await get_student_profile(db, current.id)
    if not prof or p.student_id!=prof.id: raise HTTPException(403,"Bukan karya Anda.")
    return await portfolio_service.update_portfolio(db, p, data)
@router.delete("/{portfolio_id}", status_code=204)
async def delete(portfolio_id: uuid.UUID, db: AsyncSession=Depends(get_db), current: User=Depends(get_current_user)):
    p=await portfolio_service.get_portfolio(db, portfolio_id)
    if not p: raise HTTPException(404,"Karya tidak ditemukan.")
    if current.role not in ADMIN_ROLES:
        prof=await get_student_profile(db, current.id)
        if not prof or p.student_id!=prof.id: raise HTTPException(403,"Bukan karya Anda.")
    await portfolio_service.delete_portfolio(db, p)
@router.post("/{portfolio_id}/like", response_model=LikeResult)
async def like(portfolio_id: uuid.UUID, db: AsyncSession=Depends(get_db), current: User=Depends(get_current_user)):
    p=await portfolio_service.get_portfolio(db, portfolio_id)
    if not p: raise HTTPException(404,"Karya tidak ditemukan.")
    liked,count=await portfolio_service.toggle_like(db, p, current.id)
    return LikeResult(liked=liked, likes_count=count)
