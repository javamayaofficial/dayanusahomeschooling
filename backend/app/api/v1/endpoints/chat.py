"""
Endpoint Guru AI. Semua butuh role siswa.

Streaming (POST /message) memakai Server-Sent Events. Generator streaming membuka
sesi DB sendiri (AsyncSessionLocal) agar tetap valid selama respons dikirim
bertahap — sesi dependency bisa keburu ditutup saat body streaming berjalan.
"""
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import require_roles
from app.core.config import settings
from app.core.database import AsyncSessionLocal, get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest, MessageOut, SessionOut, SessionWithPreview, SuggestionsOut,
)
from app.services import ai_service, chat_service
from app.services.auth_service import get_student_profile

router = APIRouter()
student_only = require_roles(UserRole.SISWA)


async def _profile_or_404(db: AsyncSession, user: User):
    p = await get_student_profile(db, user.id)
    if not p:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profil siswa tidak ditemukan.")
    return p


async def _owned_session(db: AsyncSession, session_id: uuid.UUID, student_id):
    s = await chat_service.get_session(db, session_id)
    if not s or s.student_id != student_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sesi tidak ditemukan.")
    return s


@router.post("/session", response_model=SessionOut, status_code=201)
async def create_session(db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    profile = await _profile_or_404(db, current)
    return await chat_service.create_session(db, profile.id)


@router.get("/sessions", response_model=list[SessionWithPreview])
async def list_sessions(db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    profile = await _profile_or_404(db, current)
    sessions = await chat_service.list_sessions(db, profile.id)
    out: list[SessionWithPreview] = []
    for s in sessions:
        m = SessionWithPreview.model_validate(s)
        m.last_message = await chat_service.last_message_text(db, s.id)
        out.append(m)
    return out


@router.get("/history/{session_id}", response_model=list[MessageOut])
async def history(session_id: uuid.UUID, db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    profile = await _profile_or_404(db, current)
    await _owned_session(db, session_id, profile.id)
    return await chat_service.list_messages(db, session_id)


@router.get("/suggestions", response_model=SuggestionsOut)
async def suggestions(db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    profile = await _profile_or_404(db, current)
    return SuggestionsOut(suggestions=await ai_service.get_suggestions(db, profile.id))


@router.delete("/session/{session_id}", status_code=204)
async def delete_session(session_id: uuid.UUID, db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    profile = await _profile_or_404(db, current)
    s = await _owned_session(db, session_id, profile.id)
    await chat_service.delete_session(db, s)


@router.post("/message")
async def send_message(payload: ChatMessageRequest, db: AsyncSession = Depends(get_db), current: User = Depends(student_only)):
    # Validasi awal (masih memakai sesi dependency yang hidup)
    if not settings.ai_enabled:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Guru AI belum dikonfigurasi (GEMINI_API_KEY kosong).")
    profile = await _profile_or_404(db, current)
    await _owned_session(db, payload.session_id, profile.id)

    async def event_stream():
        # Sesi DB baru khusus untuk streaming
        async with AsyncSessionLocal() as stream_db:
            try:
                async for delta in ai_service.chat_with_context(stream_db, payload.session_id, payload.message):
                    yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except ai_service.AINotConfigured as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            except Exception:  # pragma: no cover
                await stream_db.rollback()
                yield f"data: {json.dumps({'error': 'Terjadi kesalahan saat menghubungi Guru AI.'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
