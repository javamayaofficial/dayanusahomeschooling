from datetime import datetime, timezone
from sqlalchemy import select
from app.models.assignment import Assignment, Submission
from app.models.enums import SubmissionStatus
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, GradeRequest, SubmissionCreate
async def create_assignment(db, tutor_id, data: AssignmentCreate):
    o=Assignment(tutor_id=tutor_id, **data.model_dump()); db.add(o); await db.flush(); await db.refresh(o); return o
async def get_assignment(db, aid): return await db.get(Assignment, aid)
async def list_for_tutor(db, tutor_id):
    return list((await db.execute(select(Assignment).where(Assignment.tutor_id==tutor_id).order_by(Assignment.created_at.desc()))).scalars().all())
async def list_published(db):
    return list((await db.execute(select(Assignment).where(Assignment.is_published.is_(True)).order_by(Assignment.due_date.is_(None), Assignment.due_date))).scalars().all())
async def list_all(db):
    return list((await db.execute(select(Assignment).order_by(Assignment.created_at.desc()))).scalars().all())
async def update_assignment(db, obj, data: AssignmentUpdate):
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(obj,k,v)
    await db.flush(); await db.refresh(obj); return obj
async def delete_assignment(db, obj): await db.delete(obj); await db.flush()
async def get_my_submission(db, aid, student_id):
    return (await db.execute(select(Submission).where(Submission.assignment_id==aid, Submission.student_id==student_id))).scalar_one_or_none()
async def submit(db, aid, student_id, data: SubmissionCreate):
    sub=await get_my_submission(db, aid, student_id); now=datetime.now(timezone.utc)
    if sub:
        sub.content_text=data.content_text; sub.file_url=data.file_url; sub.submitted_at=now
        if sub.status!=SubmissionStatus.GRADED: sub.status=SubmissionStatus.SUBMITTED
    else:
        sub=Submission(assignment_id=aid, student_id=student_id, content_text=data.content_text, file_url=data.file_url, status=SubmissionStatus.SUBMITTED, submitted_at=now); db.add(sub)
    await db.flush(); await db.refresh(sub); return sub
async def list_submissions(db, aid):
    return list((await db.execute(select(Submission).where(Submission.assignment_id==aid).order_by(Submission.submitted_at))).scalars().all())
async def grade(db, data: GradeRequest):
    sub=await db.get(Submission, data.submission_id)
    if not sub: return None
    sub.grade=data.grade; sub.feedback=data.feedback; sub.status=SubmissionStatus.GRADED; sub.graded_at=datetime.now(timezone.utc)
    await db.flush(); await db.refresh(sub); return sub
