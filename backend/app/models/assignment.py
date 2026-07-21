import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import SubmissionStatus, db_enum
class Assignment(Base, UUIDMixin, TimestampMixin):
    __tablename__="assignments"
    lesson_id: Mapped[uuid.UUID|None]=mapped_column(Uuid, ForeignKey("skill_lessons.id", ondelete="SET NULL"))
    tutor_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str]=mapped_column(String(200), nullable=False); description: Mapped[str|None]=mapped_column(Text)
    due_date: Mapped[datetime|None]=mapped_column(DateTime(timezone=True)); max_score: Mapped[int]=mapped_column(Integer, default=100)
    is_published: Mapped[bool]=mapped_column(Boolean, default=True)
    submissions: Mapped[list["Submission"]]=relationship(back_populates="assignment", cascade="all, delete-orphan")
class Submission(Base, UUIDMixin, TimestampMixin):
    __tablename__="submissions"
    __table_args__=(UniqueConstraint("assignment_id","student_id", name="uq_submission_student"),)
    assignment_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("assignments.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True)
    content_text: Mapped[str|None]=mapped_column(Text); file_url: Mapped[str|None]=mapped_column(String(500))
    status: Mapped[SubmissionStatus]=mapped_column(db_enum(SubmissionStatus), default=SubmissionStatus.SUBMITTED)
    submitted_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True)); grade: Mapped[float|None]=mapped_column(Float)
    feedback: Mapped[str|None]=mapped_column(Text); graded_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True))
    assignment: Mapped["Assignment"]=relationship(back_populates="submissions")
