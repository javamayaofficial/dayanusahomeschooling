import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import ContentType, PaketLevel
class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; title: str; content_type: ContentType; content_text: str|None=None
    content_url: str|None=None; duration_minutes: int|None=None; order_index: int; is_downloadable: bool
class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200); content_type: ContentType = ContentType.TEXT
    content_text: str|None=None; content_url: str|None=None; duration_minutes: int|None=None
    order_index: int = 0; is_downloadable: bool = True
class ModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; paket: PaketLevel; subject: str; title: str; description: str|None=None
    cover_image_url: str|None=None; order_index: int; is_published: bool; created_at: datetime
class ModuleDetail(ModuleOut):
    lessons: list[LessonOut] = []
class ModuleCreate(BaseModel):
    paket: PaketLevel; subject: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=200); description: str|None=None
    cover_image_url: str|None=None; order_index: int = 0; is_published: bool = False
class ModuleUpdate(BaseModel):
    subject: str|None=None; title: str|None=None; description: str|None=None
    cover_image_url: str|None=None; order_index: int|None=None; is_published: bool|None=None
