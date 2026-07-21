"""
Guru AI — integrasi Gemini + RAG.

CATATAN VERIFIKASI: fungsi embedding & chat memerlukan GEMINI_API_KEY nyata dan
akses jaringan ke Google Generative AI; similarity_search memerlukan PostgreSQL +
ekstensi pgvector. Bagian ini TIDAK dapat dijalankan di lingkungan tanpa keduanya.
Bila key kosong, fungsi AI melempar AINotConfigured yang dipetakan endpoint ke 503.
"""
from __future__ import annotations

import asyncio
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.chat import ChatMessage
from app.models.enums import ChatRole
from app.models.knowledge_base import KnowledgeBase
from app.services import chat_service

SYSTEM_PROMPT = """Anda adalah Guru AI Dayanusa Homeschooling, bagian dari Yayasan Pondok Daya Cipta Nusantara.
Tugas Anda membantu siswa belajar dengan ramah, sabar, dan mudah dipahami.

Keahlian Anda:
- Semua mata pelajaran PKBM (Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris)
- Digital Marketing (SEO, SEM, Social Media, Email Marketing, Analytics)
- Content Creator (Scriptwriting, Video Production, Audio Production, Copywriting)
- Product Creator (Ideation, Design, Production, Launch)

Gaya bicara: seperti teman yang bijak dan suportif.
Hindari: jawaban terlalu panjang (maksimal 3-4 paragraf), berikan contoh nyata.
Jika tidak tahu: akui dan arahkan ke tutor.

Gunakan konteks berikut jika relevan:
{context}

Sekarang jawab pertanyaan siswa: {question}"""


class AINotConfigured(RuntimeError):
    """Dilempar bila GEMINI_API_KEY belum diset."""


def _require_genai():
    if not settings.ai_enabled:
        raise AINotConfigured("GEMINI_API_KEY belum dikonfigurasi di server.")
    import google.generativeai as genai  # import lokal agar app tetap boot tanpa paket
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai


EMBEDDING_DIMENSION = 768


# ---------- Embedding ----------
async def generate_embedding(text: str) -> list[float]:
    genai = _require_genai()

    def _embed():
        res = genai.embed_content(
            model=settings.EMBEDDING_MODEL,
            content=text,
            output_dimensionality=EMBEDDING_DIMENSION,
        )
        return res["embedding"]

    return await asyncio.to_thread(_embed)


# ---------- Similarity search (PostgreSQL + pgvector) ----------
async def search_similar(
    db: AsyncSession, query: str, limit: int | None = None, threshold: float | None = None
) -> list[dict]:
    limit = limit or settings.RAG_TOP_K
    threshold = settings.RAG_MAX_DISTANCE if threshold is None else threshold
    embedding = await generate_embedding(query)

    distance = KnowledgeBase.embedding.cosine_distance(embedding).label("distance")
    stmt = select(KnowledgeBase.content, KnowledgeBase.meta, distance).order_by(distance).limit(limit)
    rows = (await db.execute(stmt)).all()
    return [
        {"content": r.content, "metadata": r.meta, "distance": float(r.distance)}
        for r in rows
        if r.distance is not None and float(r.distance) < threshold
    ]


def build_context(results: list[dict]) -> str:
    if not results:
        return "(Tidak ada materi spesifik yang cocok — jawab dari pengetahuan umum Anda.)"
    parts = []
    for i, r in enumerate(results, 1):
        meta = r.get("metadata") or {}
        title = meta.get("title", "Materi")
        parts.append(f"[{i}] ({title})\n{r['content']}")
    return "\n\n".join(parts)


# ---------- Chat dengan konteks (streaming) ----------
async def chat_with_context(
    db: AsyncSession, session_id: uuid.UUID, message: str
) -> AsyncGenerator[str, None]:
    """
    Yield jawaban Gemini bertahap. Menyimpan pesan user (sebelum) dan
    pesan assistant (sesudah) ke riwayat.
    """
    genai = _require_genai()

    # 1) simpan pesan user
    await chat_service.add_message(db, session_id, ChatRole.USER, message)
    await db.commit()

    # 2) RAG: cari konteks relevan (aman bila gagal → konteks kosong)
    try:
        results = await search_similar(db, message)
    except AINotConfigured:
        raise
    except Exception:
        results = []
    context = build_context(results)

    # 3) susun prompt + sedikit riwayat percakapan
    history = await chat_service.recent_history(db, session_id, limit=8)
    convo = "\n".join(f"{'Siswa' if m.role==ChatRole.USER else 'Guru'}: {m.content}" for m in history[:-1])
    prompt = SYSTEM_PROMPT.format(context=context, question=message)
    if convo:
        prompt = f"Riwayat percakapan sebelumnya:\n{convo}\n\n{prompt}"

    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    # 4) streaming dari Gemini
    full = []
    response = await model.generate_content_async(prompt, stream=True)
    async for chunk in response:
        text = getattr(chunk, "text", "") or ""
        if text:
            full.append(text)
            yield text

    # 5) simpan jawaban assistant
    answer = "".join(full).strip() or "Maaf, saya belum bisa menjawab saat ini."
    await chat_service.add_message(db, session_id, ChatRole.ASSISTANT, answer)
    await db.commit()


# ---------- Saran pertanyaan (tanpa Gemini — aman diuji) ----------
BASE_SUGGESTIONS = [
    "Jelaskan konsep dasar aljabar dengan contoh sederhana.",
    "Apa itu SEO dan bagaimana cara memulainya?",
    "Bagaimana membuat ide konten yang menarik untuk media sosial?",
    "Tips menulis teks eksposisi yang baik?",
    "Langkah-langkah memvalidasi ide produk digital?",
]


async def get_suggestions(db: AsyncSession, student_id: uuid.UUID) -> list[str]:
    """
    Kembalikan 3 saran pertanyaan. Basisnya statis-relevan; bila ada riwayat,
    urutkan agar berbeda dari pertanyaan terakhir siswa.
    """
    suggestions = list(BASE_SUGGESTIONS)
    # personal ringan: jika siswa baru saja bertanya sesuatu, taruh saran lain di depan
    stmt = (
        select(ChatMessage.content)
        .where(ChatMessage.role == ChatRole.USER)
        .order_by(ChatMessage.created_at.desc())
        .limit(1)
    )
    last = (await db.execute(stmt)).scalar_one_or_none()
    if last:
        suggestions = [s for s in suggestions if s.lower() != last.lower()] or suggestions
    return suggestions[:3]
