import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import MediaType, PortfolioCategory
class PortfolioCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200); description: str|None=None
    media_type: MediaType = MediaType.LINK; media_url: str = Field(min_length=1, max_length=500)
    category: PortfolioCategory = PortfolioCategory.OTHER; is_for_sale: bool = False
    price: float|None=None; is_published: bool = True
class PortfolioUpdate(BaseModel):
    title: str|None=None; description: str|None=None; media_type: MediaType|None=None; media_url: str|None=None
    category: PortfolioCategory|None=None; is_for_sale: bool|None=None; price: float|None=None; is_published: bool|None=None
class PortfolioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; student_id: uuid.UUID; title: str; description: str|None=None
    media_type: MediaType; media_url: str; category: PortfolioCategory; is_for_sale: bool
    price: float|None=None; is_published: bool; likes_count: int; views_count: int; created_at: datetime
class PortfolioPage(BaseModel):
    items: list[PortfolioOut]; total: int; limit: int; offset: int
class LikeResult(BaseModel):
    liked: bool; likes_count: int
