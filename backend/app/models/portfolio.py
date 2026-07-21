import uuid
from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import MediaType, PortfolioCategory
class Portfolio(Base, UUIDMixin, TimestampMixin):
    __tablename__="portfolios"
    student_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True)
    title: Mapped[str]=mapped_column(String(200), nullable=False); description: Mapped[str|None]=mapped_column(Text)
    media_type: Mapped[MediaType]=mapped_column(Enum(MediaType), default=MediaType.LINK)
    media_url: Mapped[str]=mapped_column(String(500), nullable=False)
    category: Mapped[PortfolioCategory]=mapped_column(Enum(PortfolioCategory), default=PortfolioCategory.OTHER, index=True)
    is_for_sale: Mapped[bool]=mapped_column(Boolean, default=False); price: Mapped[float|None]=mapped_column(Float)
    is_published: Mapped[bool]=mapped_column(Boolean, default=True)
    likes_count: Mapped[int]=mapped_column(Integer, default=0); views_count: Mapped[int]=mapped_column(Integer, default=0)
class PortfolioLike(Base, UUIDMixin, TimestampMixin):
    __tablename__="portfolio_likes"
    __table_args__=(UniqueConstraint("portfolio_id","user_id", name="uq_like_once"),)
    portfolio_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID]=mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"))
