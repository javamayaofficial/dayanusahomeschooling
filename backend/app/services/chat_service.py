"""CRUD sesi & pesan chat Guru AI (murni database, tanpa AI)."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatMessage, ChatSession
from app.models.enums import ChatRole


async def create_session(db: AsyncSession, student_id: uuid.UUID, title: str = "Percakapan Baru") -> ChatSession:
    s = ChatSession(student_id=student_id, title=title)
    db.add(s)
    await db.flush()
    await db.refresh(s)
    return s


async def get_session(db: AsyncSession, session_id: uuid.UUID) -> ChatSession | None:
    return await db.get(ChatSession, session_id)


async def list_sessions(db: AsyncSession, student_id: uuid.UUID) -> list[ChatSession]:
    stmt = select(ChatSession).where(ChatSession.student_id == student_id).order_by(ChatSession.updated_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def list_messages(db: AsyncSession, session_id: uuid.UUID) -> list[ChatMessage]:
    stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    return list((await db.execute(stmt)).scalars().all())


async def last_message_text(db: AsyncSession, session_id: uuid.UUID) -> str | None:
    stmt = select(ChatMessage.content).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(1)
    return (await db.execute(stmt)).scalar_one_or_none()


async def add_message(db: AsyncSession, session_id: uuid.UUID, role: ChatRole, content: str) -> ChatMessage:
    m = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(m)
    await db.flush()
    await db.refresh(m)
    return m


async def recent_history(db: AsyncSession, session_id: uuid.UUID, limit: int = 10) -> list[ChatMessage]:
    """Ambil beberapa pesan terakhir untuk konteks percakapan (urut lama→baru)."""
    stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(limit)
    rows = list((await db.execute(stmt)).scalars().all())
    return list(reversed(rows))


async def delete_session(db: AsyncSession, session: ChatSession) -> None:
    await db.delete(session)
    await db.flush()
