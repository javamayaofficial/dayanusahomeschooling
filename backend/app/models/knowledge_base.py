"""
Basis pengetahuan RAG. Kolom embedding memakai pgvector Vector(768) di PostgreSQL.

Untuk menjaga model tetap bisa di-`create_all` di sqlite (uji non-vektor), tipe
embedding memakai `.with_variant(Text, "sqlite")` — di produksi (Postgres) tetap Vector.
Similarity search sebenarnya hanya berjalan di PostgreSQL + ekstensi pgvector.

Catatan: service AI meminta Gemini mengembalikan embedding 768 dimensi agar tetap
kompatibel dengan kolom pgvector yang sudah dimigrasikan di database produksi.
"""
import uuid

from sqlalchemy import Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin

try:  # pgvector opsional agar import tidak gagal bila belum terpasang
    from pgvector.sqlalchemy import Vector
    _EMBED_TYPE = Vector(768).with_variant(Text(), "sqlite")
except Exception:  # pragma: no cover
    _EMBED_TYPE = Text()

# JSONB di Postgres, JSON generik di sqlite
from sqlalchemy import JSON
_META_TYPE = JSONB().with_variant(JSON(), "sqlite")


class KnowledgeBase(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "knowledge_base"

    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(_EMBED_TYPE)
    meta: Mapped[dict | None] = mapped_column("metadata", _META_TYPE)
