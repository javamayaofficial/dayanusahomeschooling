from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.models.academic import Lesson, Module
from app.models.enums import ContentKind, ProgressStatus
from app.models.progress import StudentProgress
from app.models.softskill import SkillLesson, SoftSkillClass
from app.schemas.softskill import ProgressUpdate, SkillClassCreate
async def list_classes(db, published_only=True):
    s=select(SoftSkillClass).order_by(SoftSkillClass.title)
    if published_only: s=s.where(SoftSkillClass.is_published.is_(True))
    return list((await db.execute(s)).scalars().all())
async def get_class(db, class_id):
    s=select(SoftSkillClass).where(SoftSkillClass.id==class_id).options(selectinload(SoftSkillClass.lessons))
    return (await db.execute(s)).scalar_one_or_none()
async def create_class(db, data: SkillClassCreate):
    o=SoftSkillClass(**data.model_dump()); db.add(o); await db.flush(); await db.refresh(o, attribute_names=["lessons"]); return o
async def upsert_progress(db, student_id, data: ProgressUpdate):
    s=select(StudentProgress).where(StudentProgress.student_id==student_id, StudentProgress.content_kind==data.content_kind, StudentProgress.content_id==data.content_id)
    p=(await db.execute(s)).scalar_one_or_none()
    # Kolom completed_at saat ini bertipe timestamp tanpa timezone di PostgreSQL.
    # Simpan nilai naive agar asyncpg tidak gagal pada insert/update progres.
    ca=datetime.utcnow() if data.status==ProgressStatus.COMPLETED else None
    if p: p.status=data.status; p.score=data.score; p.completed_at=ca
    else: p=StudentProgress(student_id=student_id, content_kind=data.content_kind, content_id=data.content_id, status=data.status, score=data.score, completed_at=ca); db.add(p)
    await db.flush(); await db.refresh(p); return p
async def list_progress(db, student_id):
    return list((await db.execute(select(StudentProgress).where(StudentProgress.student_id==student_id))).scalars().all())
async def _count(db, s): return (await db.execute(s)).scalar_one() or 0
async def dashboard_summary(db, student_id, paket):
    at=select(func.count(Lesson.id)).join(Module, Lesson.module_id==Module.id).where(Module.is_published.is_(True))
    if paket: at=at.where(Module.paket==paket)
    academic_total=await _count(db, at)
    softskill_total=await _count(db, select(func.count(SkillLesson.id)).join(SoftSkillClass, SkillLesson.class_id==SoftSkillClass.id).where(SoftSkillClass.is_published.is_(True)))
    async def done(k): return await _count(db, select(func.count(StudentProgress.id)).where(StudentProgress.student_id==student_id, StudentProgress.content_kind==k, StudentProgress.status==ProgressStatus.COMPLETED))
    ad=await done(ContentKind.MODULE_LESSON); sd=await done(ContentKind.SKILL_LESSON)
    ma=await _count(db, select(func.count(Module.id)).where(Module.is_published.is_(True)))
    ca=await _count(db, select(func.count(SoftSkillClass.id)).where(SoftSkillClass.is_published.is_(True)))
    pct=lambda d,t: round(d/t*100,1) if t else 0.0
    return {"academic":{"total":academic_total,"completed":ad,"percent":pct(ad,academic_total)},
            "soft_skill":{"total":softskill_total,"completed":sd,"percent":pct(sd,softskill_total)},
            "modules_available":ma,"classes_available":ca,"portfolio_count":0}
