from sqlalchemy import func, select
from app.models.portfolio import Portfolio, PortfolioLike
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate
async def create_portfolio(db, student_id, data: PortfolioCreate):
    o=Portfolio(student_id=student_id, **data.model_dump()); db.add(o); await db.flush(); await db.refresh(o); return o
async def get_portfolio(db, pid): return await db.get(Portfolio, pid)
async def list_public(db, category=None, limit=12, offset=0):
    base=select(Portfolio).where(Portfolio.is_published.is_(True)); cnt=select(func.count(Portfolio.id)).where(Portfolio.is_published.is_(True))
    if category: base=base.where(Portfolio.category==category); cnt=cnt.where(Portfolio.category==category)
    total=(await db.execute(cnt)).scalar_one()
    items=list((await db.execute(base.order_by(Portfolio.created_at.desc()).limit(limit).offset(offset))).scalars().all())
    return items, total
async def list_mine(db, student_id):
    return list((await db.execute(select(Portfolio).where(Portfolio.student_id==student_id).order_by(Portfolio.created_at.desc()))).scalars().all())
async def increment_views(db, p): p.views_count+=1; await db.flush()
async def update_portfolio(db, p, data: PortfolioUpdate):
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(p,k,v)
    await db.flush(); await db.refresh(p); return p
async def delete_portfolio(db, p): await db.delete(p); await db.flush()
async def toggle_like(db, p, user_id):
    ex=(await db.execute(select(PortfolioLike).where(PortfolioLike.portfolio_id==p.id, PortfolioLike.user_id==user_id))).scalar_one_or_none()
    if ex: await db.delete(ex); p.likes_count=max(0,p.likes_count-1); liked=False
    else: db.add(PortfolioLike(portfolio_id=p.id, user_id=user_id)); p.likes_count+=1; liked=True
    await db.flush(); return liked, p.likes_count
