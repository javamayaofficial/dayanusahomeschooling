from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.academic import Lesson, Module
from app.schemas.academic import LessonCreate, ModuleCreate, ModuleUpdate
async def list_modules(db, paket=None, published_only=True):
    s=select(Module).order_by(Module.order_index, Module.subject)
    if paket: s=s.where(Module.paket==paket)
    if published_only: s=s.where(Module.is_published.is_(True))
    return list((await db.execute(s)).scalars().all())
async def get_module(db, module_id):
    s=select(Module).where(Module.id==module_id).options(selectinload(Module.lessons))
    return (await db.execute(s)).scalar_one_or_none()
async def create_module(db, data: ModuleCreate):
    m=Module(**data.model_dump()); db.add(m); await db.flush(); await db.refresh(m, attribute_names=["lessons"]); return m
async def update_module(db, module, data: ModuleUpdate):
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(module,k,v)
    await db.flush(); await db.refresh(module, attribute_names=["lessons"]); return module
async def add_lesson(db, module_id, data: LessonCreate):
    l=Lesson(module_id=module_id, **data.model_dump()); db.add(l); await db.flush(); await db.refresh(l); return l
