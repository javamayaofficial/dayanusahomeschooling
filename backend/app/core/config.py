from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")
    APP_NAME: str = "Dayanusa Homeschooling API"; APP_ENV: str = "development"; DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "postgresql://dayanusa:dayanusa_dev@localhost:5432/dayanusa"
    SECRET_KEY: str = "ubah-dengan-string-acak-yang-panjang"; ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60; REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    AI_PROVIDER: str = "gemini"; GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"; EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    RAG_TOP_K: int = 5; RAG_MAX_DISTANCE: float = 0.7
    @field_validator("DATABASE_URL")
    @classmethod
    def _async(cls, v): return v.replace("postgresql://","postgresql+asyncpg://",1) if v.startswith("postgresql://") else v
    @property
    def cors_origins(self): return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]
    @property
    def ai_enabled(self) -> bool: return bool(self.GEMINI_API_KEY)
@lru_cache
def get_settings(): return Settings()
settings = get_settings()
