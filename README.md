# Dayanusa Homeschooling

Platform homeschooling **Yayasan Pondok Daya Cipta Nusantara** yang memadukan:

- **Pendidikan formal (PKBM)** — jalur ijazah kesetaraan Paket A/B/C.
- **Keterampilan digital bersertifikat BNSP** — Digital Marketing, Content Creator, Product Creator (berbasis SKKNI).
- **Portofolio karya siswa** — showcase publik, dapat ditandai untuk dijual.
- **Guru AI 24 jam** — asisten belajar RAG (Retrieval-Augmented Generation) dengan Gemini.

> ⚠️ **Pengguna adalah anak usia 10–18 tahun.** Beberapa pengaman kepatuhan (UU PDP,
> persetujuan orang tua, moderasi Guru AI, rate-limit) **belum** diimplementasikan —
> lihat bagian [Status & Roadmap](#status--roadmap).

## Arsitektur

```
Next.js 14 (App Router, TS, Tailwind)  ──HTTP/SSE──►  FastAPI (async)
                                                          │
                                                          ├─ PostgreSQL + pgvector
                                                          └─ Google Gemini (embedding + chat)
```

- **Frontend**: Next.js 14, TypeScript, Tailwind. Auth berbasis JWT (access + refresh).
- **Backend**: FastAPI + SQLAlchemy 2 (async) + Alembic. RBAC per peran.
- **Basis data**: PostgreSQL; ekstensi **pgvector** untuk pencarian kemiripan RAG.
- **AI**: Gemini `models/gemini-embedding-001` (embedding) + `gemini-flash-latest` (chat, streaming).

## Struktur repo

```
dayanusa-homeschooling/
├─ backend/            # FastAPI + SQLAlchemy + Alembic + Gemini/RAG
│  ├─ app/             # config, models, schemas, services, api
│  ├─ alembic/         # migrasi 0001–0005
│  ├─ scripts/         # seed_knowledge_base.py
│  ├─ tests/           # pytest (sqlite)
│  └─ requirements.txt
├─ frontend/           # Next.js 14 (App Router)
│  └─ app/             # pages, components, lib, types
├─ docs/               # PRD + catatan tiap fase
├─ docker-compose.yml  # db (pgvector) + backend + frontend
└─ .github/workflows/  # CI: pytest backend + build frontend
```

## Prasyarat

- Node.js 20+, Python 3.12+, dan PostgreSQL 14+ **dengan ekstensi pgvector**
  (atau cukup Docker + Docker Compose).
- **GEMINI_API_KEY** dari Google AI Studio (agar Guru AI berfungsi).

## Jalankan cepat (Docker Compose)

```bash
# dari root repo
export GEMINI_API_KEY=isikan_key_anda        # opsional; tanpa ini Guru AI menampilkan 503
export SECRET_KEY=$(openssl rand -hex 32)
docker compose up --build
# Frontend: http://localhost:3000   |   API: http://localhost:8000/docs
```

Migrasi dijalankan otomatis saat backend start. Untuk mengisi basis pengetahuan RAG:

```bash
docker compose exec backend python scripts/seed_knowledge_base.py
```

## Jalankan manual (tanpa Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # isi DATABASE_URL (Postgres+pgvector) & GEMINI_API_KEY
alembic upgrade head
python scripts/seed_knowledge_base.py   # butuh GEMINI_API_KEY
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Variabel lingkungan

**backend/.env** (lihat `.env.example`)

| Nama | Contoh | Catatan |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Wajib Postgres+pgvector di produksi |
| `SECRET_KEY` | string acak panjang | Untuk JWT |
| `FRONTEND_ORIGIN` | `https://app.contoh.id` | CORS (boleh dipisah koma) |
| `GEMINI_API_KEY` | `AIza…` | **Server-side saja** |
| `GEMINI_MODEL` | `gemini-flash-latest` | |
| `EMBEDDING_MODEL` | `models/gemini-embedding-001` | |

**frontend/.env.local**

| Nama | Contoh |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.contoh.id` |

> 🔐 **Keamanan**: `GEMINI_API_KEY` **tidak boleh** memakai prefix `NEXT_PUBLIC_` —
> kunci hanya hidup di backend. Frontend memanggil Gemini lewat endpoint `/chat/*`.

## Testing

```bash
cd backend && python -m pytest -q      # 11 test (sqlite)
cd frontend && npm run build           # verifikasi tipe + build 17 rute
```

## Deployment (saran)

- **Frontend → Vercel**: import repo, set root ke `frontend/`, env `NEXT_PUBLIC_API_URL`. Next.js terdeteksi otomatis.
- **Backend → Railway / Render**: root `backend/`, gunakan `Dockerfile` (menjalankan `alembic upgrade head` lalu uvicorn), set semua env di atas.
- **Database → Postgres terkelola dengan pgvector** (Railway, Neon, Supabase, atau RDS). Setelah DB siap: jalankan seed sekali.
- Set `FRONTEND_ORIGIN` backend ke domain Vercel, dan `NEXT_PUBLIC_API_URL` frontend ke domain backend.

## Status & Roadmap

**Selesai & terverifikasi (build/test):** Auth (JWT+RBAC), Akademik (modul PKBM, kelas soft-skill, progres), Tugas & Submission, Portofolio + showcase publik + like, Guru AI (endpoint + streaming SSE + halaman chat), migrasi 0001–0005.

**Perlu diuji di lingkungan nyata** (butuh kunci + Postgres+pgvector; tak bisa di CI): embedding, vector similarity search, streaming Gemini live, seed knowledge base.

**Belum diimplementasikan:**
- Unggah berkas ke penyimpanan awan (kini berbasis tautan).
- Panel admin (kelola modul/kelas/tugas) + dashboard analitik.
- Fitur pemantauan anak untuk orang tua.
- Marketplace/pembayaran karya portofolio.
- Pengaman pengguna minor: verifikasi email, persetujuan orang tua, rate-limit & moderasi Guru AI.

## Lisensi

Proprietary — © 2026 Yayasan Pondok Daya Cipta Nusantara. Lihat `LICENSE`.
