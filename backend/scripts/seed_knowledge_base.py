"""
Seed basis pengetahuan RAG dari materi PKBM & soft skill.

Proses: kumpulkan teks (judul + konten lesson) → chunking per paragraf (maks ~500 char)
→ embedding via Gemini text-embedding-004 → simpan ke knowledge_base beserta metadata.

MEMERLUKAN: GEMINI_API_KEY + PostgreSQL dengan ekstensi pgvector.
Jalankan:  python scripts/seed_knowledge_base.py
"""
import asyncio

from sqlalchemy import delete, select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.academic import Lesson, Module
from app.models.knowledge_base import KnowledgeBase
from app.models.softskill import SkillLesson, SoftSkillClass
from app.services import ai_service

MAX_CHARS = 500


def chunk_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    """Pecah per paragraf; paragraf panjang dipotong per kalimat hingga <= max_chars."""
    chunks: list[str] = []
    for para in (p.strip() for p in text.split("\n") if p.strip()):
        if len(para) <= max_chars:
            chunks.append(para)
            continue
        buf = ""
        for sentence in para.replace("! ", ". ").replace("? ", ". ").split(". "):
            piece = sentence.strip()
            if not piece:
                continue
            if len(buf) + len(piece) + 2 > max_chars:
                if buf:
                    chunks.append(buf.strip())
                buf = piece
            else:
                buf = f"{buf}. {piece}" if buf else piece
        if buf:
            chunks.append(buf.strip())
    return chunks


async def collect_documents(db) -> list[dict]:
    docs: list[dict] = []

    # Modul PKBM + lessons
    modules = (await db.execute(select(Module))).scalars().all()
    for m in modules:
        base = f"{m.title}\n{m.description or ''}"
        docs.append({"text": base, "meta": {"source": "module", "title": m.title, "category": m.subject}})
        lessons = (await db.execute(select(Lesson).where(Lesson.module_id == m.id))).scalars().all()
        for l in lessons:
            if l.content_text:
                docs.append({"text": f"{l.title}\n{l.content_text}",
                             "meta": {"source": "module", "title": m.title, "category": m.subject}})

    # Soft skill + lessons
    classes = (await db.execute(select(SoftSkillClass))).scalars().all()
    for c in classes:
        base = f"{c.title}\n{c.description or ''}"
        docs.append({"text": base, "meta": {"source": "softskill", "title": c.title, "category": c.category.value}})
        lessons = (await db.execute(select(SkillLesson).where(SkillLesson.class_id == c.id))).scalars().all()
        for l in lessons:
            if l.content_text:
                docs.append({"text": f"{l.title}\n{l.content_text}",
                             "meta": {"source": "softskill", "title": c.title, "category": c.category.value}})
    return docs


async def seed() -> None:
    if not settings.ai_enabled:
        raise SystemExit("GEMINI_API_KEY belum diset. Isi .env terlebih dahulu.")

    async with AsyncSessionLocal() as db:
        await db.execute(delete(KnowledgeBase))  # reset
        docs = await collect_documents(db)
        total = 0
        for doc in docs:
            for idx, chunk in enumerate(chunk_text(doc["text"])):
                embedding = await ai_service.generate_embedding(chunk)
                meta = {**doc["meta"], "chunk_index": idx}
                db.add(KnowledgeBase(content=chunk, embedding=embedding, meta=meta))
                total += 1
        await db.commit()
        print(f"Seed knowledge base selesai: {total} chunk dari {len(docs)} dokumen.")


if __name__ == "__main__":
    asyncio.run(seed())
