import uuid
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ContentType, SkillLevel, SoftSkillCategory
class SoftSkillClass(Base, UUIDMixin, TimestampMixin):
    __tablename__="soft_skill_classes"
    title: Mapped[str]=mapped_column(String(200), nullable=False)
    category: Mapped[SoftSkillCategory]=mapped_column(Enum(SoftSkillCategory), index=True)
    description: Mapped[str|None]=mapped_column(Text); skkni_code: Mapped[str|None]=mapped_column(String(100))
    level: Mapped[SkillLevel]=mapped_column(Enum(SkillLevel), default=SkillLevel.BEGINNER)
    is_bnsp_certified: Mapped[bool]=mapped_column(Boolean, default=False)
    cover_image_url: Mapped[str|None]=mapped_column(String(500)); is_published: Mapped[bool]=mapped_column(Boolean, default=False)
    lessons: Mapped[list["SkillLesson"]]=relationship(back_populates="skill_class", cascade="all, delete-orphan", order_by="SkillLesson.order_index")
class SkillLesson(Base, UUIDMixin, TimestampMixin):
    __tablename__="skill_lessons"
    class_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("soft_skill_classes.id", ondelete="CASCADE"), index=True)
    title: Mapped[str]=mapped_column(String(200), nullable=False)
    content_type: Mapped[ContentType]=mapped_column(Enum(ContentType), default=ContentType.VIDEO)
    content_text: Mapped[str|None]=mapped_column(Text); content_url: Mapped[str|None]=mapped_column(String(500))
    duration_minutes: Mapped[int|None]=mapped_column(Integer); order_index: Mapped[int]=mapped_column(Integer, default=0)
    is_downloadable: Mapped[bool]=mapped_column(Boolean, default=True)
    skill_class: Mapped["SoftSkillClass"]=relationship(back_populates="lessons")
