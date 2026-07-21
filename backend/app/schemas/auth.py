import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from app.models.enums import LearningTrack, PaketLevel, UserRole
class RegisterRequest(BaseModel):
    email: EmailStr; password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=150); role: UserRole
    phone: str|None=None; birth_date: date|None=None; paket: PaketLevel|None=None
    track: LearningTrack = LearningTrack.PKBM_PLUS_SOFTSKILL
    @model_validator(mode="after")
    def _v(self):
        if self.role in {UserRole.ADMIN_PKBM, UserRole.ADMIN_LSP, UserRole.ADMIN_YAYASAN}:
            raise ValueError("Peran admin tidak dapat melakukan registrasi mandiri.")
        return self
class LoginRequest(BaseModel):
    email: EmailStr; password: str
class TokenPair(BaseModel):
    access_token: str; refresh_token: str; token_type: str = "bearer"
class RefreshRequest(BaseModel):
    refresh_token: str
class AccessToken(BaseModel):
    access_token: str; token_type: str = "bearer"
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; email: EmailStr; full_name: str; role: UserRole
    phone: str|None=None; is_active: bool; is_verified: bool; created_at: datetime
class AuthResponse(BaseModel):
    user: UserOut; tokens: TokenPair
