"""Schema Pydantic untuk Guru AI (chat)."""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ChatRole


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    role: ChatRole
    content: str
    created_at: datetime


class SessionWithPreview(SessionOut):
    last_message: str | None = None


class ChatMessageRequest(BaseModel):
    session_id: uuid.UUID
    message: str = Field(min_length=1, max_length=4000)


class SuggestionsOut(BaseModel):
    suggestions: list[str]
