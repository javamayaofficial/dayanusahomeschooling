"""Riwayat chat Guru AI: ChatSession -> ChatMessage.

Spesifikasi menyebut ChatHistory(session_id, role, content). Di sini dipecah jadi
ChatSession (agar bisa banyak sesi + judul) dan ChatMessage (baris pesan), yang
memetakan langsung ke endpoint /chat/session, /chat/message, /chat/history/{session_id}.
"""
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ChatRole


class ChatSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "chat_sessions"

    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="Percakapan Baru")

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )


class ChatMessage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[ChatRole] = mapped_column(Enum(ChatRole))
    content: Mapped[str] = mapped_column(Text)

    session: Mapped["ChatSession"] = relationship(back_populates="messages")
