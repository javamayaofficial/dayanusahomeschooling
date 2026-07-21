import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.dependencies.auth import get_current_user, require_roles
from app.core.database import get_db
from app.models.enums import ADMIN_ROLES, UserRole
from app.models.user import User
from app.schemas.assignment import (AssignmentCreate, AssignmentOut, AssignmentUpdate, AssignmentWithMySubmission, GradeRequest, SubmissionCreate, SubmissionOut)
from app.services import assignment_service
from app.services.auth_service import get_student_profile
router = APIRouter()
tutor_only = require_roles(UserRole.TUTOR)
student_only = require_roles(UserRole.SISWA)
@router.post("", response_model=AssignmentOut, status_code=201)
async def create_assignment(data: AssignmentCreate, db: AsyncSession=Depends(get_db), current: User=Depends(tutor_only)):
    return await assignment_service.create_assignment(db, current.id, data)
@router.get("", response_model=list[AssignmentWithMySubmission])
async def list_assignments(db: AsyncSession=Depends(get_db), current: User=Depends(get_current_user)):
    if current.role==UserRole.SISWA:
        profile=await get_student_profile(db, current.id); items=await assignment_service.list_published(db); out=[]
        for a in items:
            sub=await assignment_service.get_my_submission(db, a.id, profile.id) if profile else None
            m=AssignmentWithMySubmission.model_validate(a); m.my_submission=SubmissionOut.model_validate(sub) if sub else None; out.append(m)
        return out
    if current.role==UserRole.TUTOR: items=await assignment_service.list_for_tutor(db, current.id)
    elif current.role in ADMIN_ROLES: items=await assignment_service.list_all(db)
    else: items=await assignment_service.list_published(db)
    return [AssignmentWithMySubmission.model_validate(a) for a in items]
@router.get("/{assignment_id}", response_model=AssignmentOut)
async def get_assignment(assignment_id: uuid.UUID, db: AsyncSession=Depends(get_db), _: User=Depends(get_current_user)):
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a: raise HTTPException(404,"Tugas tidak ditemukan.")
    return a
@router.put("/{assignment_id}", response_model=AssignmentOut)
async def update_assignment(assignment_id: uuid.UUID, data: AssignmentUpdate, db: AsyncSession=Depends(get_db), current: User=Depends(tutor_only)):
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a: raise HTTPException(404,"Tugas tidak ditemukan.")
    if a.tutor_id!=current.id: raise HTTPException(403,"Bukan tugas Anda.")
    return await assignment_service.update_assignment(db, a, data)
@router.delete("/{assignment_id}", status_code=204)
async def delete_assignment(assignment_id: uuid.UUID, db: AsyncSession=Depends(get_db), current: User=Depends(get_current_user)):
    if current.role not in (UserRole.TUTOR, *ADMIN_ROLES): raise HTTPException(403,"Tidak diizinkan.")
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a: raise HTTPException(404,"Tugas tidak ditemukan.")
    if current.role==UserRole.TUTOR and a.tutor_id!=current.id: raise HTTPException(403,"Bukan tugas Anda.")
    await assignment_service.delete_assignment(db, a)
@router.post("/{assignment_id}/submit", response_model=SubmissionOut, status_code=201)
async def submit_assignment(assignment_id: uuid.UUID, data: SubmissionCreate, db: AsyncSession=Depends(get_db), current: User=Depends(student_only)):
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a or not a.is_published: raise HTTPException(404,"Tugas tidak ditemukan.")
    profile=await get_student_profile(db, current.id)
    if not profile: raise HTTPException(404,"Profil siswa tidak ditemukan.")
    return await assignment_service.submit(db, assignment_id, profile.id, data)
@router.get("/{assignment_id}/submissions", response_model=list[SubmissionOut])
async def list_submissions(assignment_id: uuid.UUID, db: AsyncSession=Depends(get_db), current: User=Depends(tutor_only)):
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a: raise HTTPException(404,"Tugas tidak ditemukan.")
    if a.tutor_id!=current.id: raise HTTPException(403,"Bukan tugas Anda.")
    return await assignment_service.list_submissions(db, assignment_id)
@router.put("/{assignment_id}/grade", response_model=SubmissionOut)
async def grade_submission(assignment_id: uuid.UUID, data: GradeRequest, db: AsyncSession=Depends(get_db), current: User=Depends(tutor_only)):
    a=await assignment_service.get_assignment(db, assignment_id)
    if not a: raise HTTPException(404,"Tugas tidak ditemukan.")
    if a.tutor_id!=current.id: raise HTTPException(403,"Bukan tugas Anda.")
    sub=await assignment_service.grade(db, data)
    if not sub: raise HTTPException(404,"Submission tidak ditemukan.")
    return sub
