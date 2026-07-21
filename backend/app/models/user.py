import uuid
from datetime import date
from sqlalchemy import Boolean, Date, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import LearningTrack, PaketLevel, StudentStatus, UserRole
class User(Base, UUIDMixin, TimestampMixin):
    __tablename__="users"
    email: Mapped[str]=mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str]=mapped_column(String(255), nullable=False)
    full_name: Mapped[str]=mapped_column(String(150), nullable=False)
    role: Mapped[UserRole]=mapped_column(Enum(UserRole), nullable=False, index=True)
    phone: Mapped[str|None]=mapped_column(String(20)); address: Mapped[str|None]=mapped_column(Text)
    birth_date: Mapped[date|None]=mapped_column(Date); profile_picture: Mapped[str|None]=mapped_column(String(500))
    is_active: Mapped[bool]=mapped_column(Boolean, default=True); is_verified: Mapped[bool]=mapped_column(Boolean, default=False)
    student_profile: Mapped["StudentProfile"]=relationship(back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="StudentProfile.user_id")
class StudentProfile(Base, UUIDMixin, TimestampMixin):
    __tablename__="student_profiles"
    user_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    parent_id: Mapped[uuid.UUID|None]=mapped_column(Uuid, ForeignKey("users.id"))
    paket: Mapped[PaketLevel|None]=mapped_column(Enum(PaketLevel))
    track: Mapped[LearningTrack]=mapped_column(Enum(LearningTrack), default=LearningTrack.PKBM_PLUS_SOFTSKILL)
    nis: Mapped[str|None]=mapped_column(String(30), unique=True); enrollment_date: Mapped[date|None]=mapped_column(Date)
    status: Mapped[StudentStatus]=mapped_column(Enum(StudentStatus), default=StudentStatus.ACTIVE)
    user: Mapped["User"]=relationship(back_populates="student_profile", foreign_keys=[user_id])
