# Fase 4B — Guru AI (RAG + Gemini): BACKEND

Menambahkan asisten belajar AI 24/7 dengan Retrieval-Augmented Generation.

## Yang dibangun
- **Model** `KnowledgeBase` (content, embedding VECTOR(768), metadata JSONB) +
  `ChatSession` & `ChatMessage`.
- **Migrasi 0005** (dialect-aware): di PostgreSQL → `CREATE EXTENSION vector`,
  kolom `VECTOR(768)`, index **ivfflat cosine**; di sqlite → embedding TEXT (untuk uji).
- **ai_service.py**: `generate_embedding`, `search_similar` (cosine distance < 0.7),
  `build_context`, `chat_with_context` (async generator streaming), `get_suggestions`.
  System prompt Guru AI sesuai spesifikasi.
- **chat_service.py**: CRUD sesi & pesan, riwayat percakapan.
- **Endpoint** `/api/v1/chat`: `POST /session`, `GET /sessions`, `POST /message` (SSE),
  `GET /history/{id}`, `GET /suggestions`, `DELETE /session/{id}` — semua role siswa.
- **scripts/seed_knowledge_base.py**: kumpulkan materi → chunk (≤500 char) → embed → simpan.

## Keamanan
`GEMINI_API_KEY` **hanya di server** (`.env`), tidak pernah `NEXT_PUBLIC_`.

## Status verifikasi (JUJUR)
✅ Terverifikasi di sandbox:
- 11/11 pytest lolos: app boot dengan router chat, sesi/riwayat/suggestions,
  RBAC (tutor 403, non-pemilik 404), **503 saat GEMINI_API_KEY kosong**, fondasi utuh.
- Rantai migrasi 0001→0005 upgrade & downgrade bersih di sqlite (15 tabel).

⚠️ BELUM bisa diuji di sandbox (perlu kredensial Anda):
- `generate_embedding`, `search_similar`, streaming `chat_with_context` →
  butuh **GEMINI_API_KEY** nyata + jaringan ke Google Generative AI.
- Vector similarity (ivfflat/cosine) → butuh **PostgreSQL + ekstensi pgvector**.
- `seed_knowledge_base.py` → butuh keduanya.

## Cara menjalankan (lingkungan nyata)
    pip install -r requirements.txt
    cp .env.example .env      # isi DATABASE_URL (Postgres+pgvector) & GEMINI_API_KEY
    alembic upgrade head
    python scripts/seed_knowledge_base.py
    uvicorn app.main:app --reload

## Kontrak SSE (untuk frontend)
`POST /api/v1/chat/message` → `text/event-stream`, tiap baris:
`data: {"delta":"..."}`  lalu  `data: {"done":true}`  atau  `data: {"error":"..."}`
