"""Fixtures pytest: sqlite in-memory + AsyncClient + helper."""
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_db
from app.main import app
from app.models import Base

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(TEST_DB_URL, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session):
    async def _override():
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    app.dependency_overrides[get_db] = _override
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def register(client, email, role="siswa", paket="paket_c"):
    payload = {"email": email, "password": "rahasia123", "full_name": "Uji", "role": role}
    if role == "siswa":
        payload["paket"] = paket
    return await client.post("/api/v1/auth/register", json=payload)


async def student_header(client, email="siswa@dayanusa.id"):
    r = await register(client, email, role="siswa")
    return {"Authorization": f"Bearer {r.json()['tokens']['access_token']}"}


async def tutor_header(client, email="tutor@dayanusa.id"):
    r = await register(client, email, role="tutor")
    return {"Authorization": f"Bearer {r.json()['tokens']['access_token']}"}
