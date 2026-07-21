import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import ContentKind, ContentType, ProgressStatus, SkillLevel, SoftSkillCategory
class SkillLessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; title: str; content_type: ContentType; content_text: str|None=None
    content_url: str|None=None; duration_minutes: int|None=None; order_index: int; is_downloadable: bool
class SkillClassOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; title: str; category: SoftSkillCategory; description: str|None=None
    skkni_code: str|None=None; level: SkillLevel; is_bnsp_certified: bool
    cover_image_url: str|None=None; is_published: bool; created_at: datetime
class SkillClassDetail(SkillClassOut):
    lessons: list[SkillLessonOut] = []
class SkillClassCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200); category: SoftSkillCategory
    description: str|None=None; skkni_code: str|None=None; level: SkillLevel = SkillLevel.BEGINNER
    is_bnsp_certified: bool = False; is_published: bool = False
class ProgressUpdate(BaseModel):
    content_kind: ContentKind; content_id: uuid.UUID; status: ProgressStatus = ProgressStatus.COMPLETED; score: float|None=None
class ProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; content_kind: ContentKind; content_id: uuid.UUID; status: ProgressStatus
    score: float|None=None; completed_at: datetime|None=None
class ProgressSummary(BaseModel):
    total: int; completed: int; percent: float
class DashboardSummary(BaseModel):
    academic: ProgressSummary; soft_skill: ProgressSummary
    modules_available: int; classes_available: int; portfolio_count: int = 0
