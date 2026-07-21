import uuid
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ContentType, PaketLevel, db_enum
class Module(Base, UUIDMixin, TimestampMixin):
    __tablename__="modules"
    paket: Mapped[PaketLevel]=mapped_column(db_enum(PaketLevel), index=True, nullable=False)
    subject: Mapped[str]=mapped_column(String(100), nullable=False); title: Mapped[str]=mapped_column(String(200), nullable=False)
    description: Mapped[str|None]=mapped_column(Text); cover_image_url: Mapped[str|None]=mapped_column(String(500))
    order_index: Mapped[int]=mapped_column(Integer, default=0); is_published: Mapped[bool]=mapped_column(Boolean, default=False)
    lessons: Mapped[list["Lesson"]]=relationship(back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index")
class Lesson(Base, UUIDMixin, TimestampMixin):
    __tablename__="lessons"
    module_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("modules.id", ondelete="CASCADE"), index=True)
    title: Mapped[str]=mapped_column(String(200), nullable=False)
    content_type: Mapped[ContentType]=mapped_column(db_enum(ContentType), default=ContentType.TEXT)
    content_text: Mapped[str|None]=mapped_column(Text); content_url: Mapped[str|None]=mapped_column(String(500))
    duration_minutes: Mapped[int|None]=mapped_column(Integer); order_index: Mapped[int]=mapped_column(Integer, default=0)
    is_downloadable: Mapped[bool]=mapped_column(Boolean, default=True)
    module: Mapped["Module"]=relationship(back_populates="lessons")
