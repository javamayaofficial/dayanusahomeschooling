import uuid
from datetime import datetime
from sqlalchemy import Float, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ContentKind, ProgressStatus, db_enum
class StudentProgress(Base, UUIDMixin, TimestampMixin):
    __tablename__="student_progress"
    __table_args__=(UniqueConstraint("student_id","content_kind","content_id", name="uq_progress_target"),)
    student_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True)
    content_kind: Mapped[ContentKind]=mapped_column(db_enum(ContentKind)); content_id: Mapped[uuid.UUID]=mapped_column(Uuid)
    status: Mapped[ProgressStatus]=mapped_column(db_enum(ProgressStatus), default=ProgressStatus.NOT_STARTED)
    score: Mapped[float|None]=mapped_column(Float); completed_at: Mapped[datetime|None]
