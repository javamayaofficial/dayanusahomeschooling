# Product Requirements Document (PRD) — Dayanusa Homeschooling

| | |
|---|---|
| **Produk** | Dayanusa Homeschooling |
| **Brand** | DAYANUSA |
| **Penyelenggara** | Yayasan Pondok Daya Cipta Nusantara |
| **Jenis** | Platform Homeschooling Online (Web-based, PWA) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 21 Juli 2026 |
| **Status** | Draft untuk Review Stakeholder |
| **Pemilik Dokumen** | Product Manager |
| **Reviewer** | Founder, Lead Developer, Content Lead, Marketing Lead |

### Riwayat Revisi
| Versi | Tanggal | Perubahan | Penulis |
|-------|---------|-----------|---------|
| 1.0 | 21 Jul 2026 | Draft awal lengkap (visi s/d roadmap & risk register) | PM |

---

## 1. Ringkasan Eksekutif

Dayanusa Homeschooling adalah platform homeschooling online yang menyatukan tiga hal yang selama ini terpisah di pasar pendidikan alternatif Indonesia: **pendidikan formal** (ijazah PKBM Paket A/B/C melalui mitra seperti Digy Homeschool), **pendidikan vokasi bersertifikat nasional** (BNSP di bidang Digital Marketing, Content Creator, Product Creator), dan **portofolio karya nyata** yang dibangun siswa sejak dini serta dapat dipublikasikan dan dijual.

Nilai jual utama yang membedakan Dayanusa dari homeschooling konvensional adalah janji kelulusan yang konkret: *"Lulus dengan Ijazah PKBM + Sertifikat BNSP + Portofolio Karya."* Guru AI 24/7 berbasis Retrieval Augmented Generation (RAG) menjadi pendamping belajar yang menurunkan ketergantungan pada ketersediaan tutor.

Target peluncuran MVP adalah **3–6 bulan**. Karena daftar fitur Priority-1 pada draft awal cukup luas untuk rentang waktu tersebut, dokumen ini merekomendasikan pembagian MVP menjadi **MVP Core** (yang benar-benar dirilis lebih dulu) dan **Fast-Follow**, agar tim dapat melaunch tepat waktu tanpa mengorbankan nilai inti produk.

**Tujuan bisnis 12 bulan pertama (indikatif, perlu divalidasi):** memperoleh kohort siswa aktif pertama, membuktikan bahwa siswa dapat mencapai status *portfolio-ready*, dan memvalidasi kesediaan orang tua membayar untuk paket gabungan formal + vokasi.

---

## 2. Latar Belakang & Problem Statement

Industri digital Indonesia tumbuh cepat dan membutuhkan talenta muda yang siap kerja, sementara jalur pendidikan homeschooling yang ada umumnya masih berfokus pada capaian akademik dan penyetaraan ijazah, belum pada keterampilan praktis yang terstruktur. Di sisi lain, sertifikasi BNSP telah menjadi standar kompetensi yang diakui industri dan pemerintah, dan portofolio karya terbukti menjadi bukti kemampuan yang lebih kuat dibanding ijazah semata.

Masalah inti yang dijawab produk ini:

1. Siswa homeschooling kerap lulus tanpa bekal keterampilan praktis yang relevan dengan dunia kerja.
2. Orang tua kesulitan menemukan penyelenggara homeschooling yang mengajarkan soft skill digital secara terstruktur dan terukur.
3. Banyak lulusan tidak memiliki portofolio maupun sertifikasi kompetensi yang diakui industri.
4. Belum ada platform yang mengintegrasikan pendidikan formal, vokasi, dan portofolio dalam satu ekosistem.

**Catatan PM:** karena mayoritas pengguna akhir adalah anak usia 10–18 tahun, seluruh keputusan produk harus tunduk pada kerangka perlindungan data anak (UU No. 27/2022 tentang Pelindungan Data Pribadi) dan keamanan anak. Ini bukan sekadar fitur, melainkan batasan desain yang mengikat (lihat Bagian 10 dan Bagian 15).

---

## 3. Visi, Misi, dan Nilai Jual Utama

**Visi.** Menjadi platform homeschooling terkemuka di Indonesia yang memadukan pendidikan formal (ijazah PKBM) dengan pendidikan vokasi (sertifikasi BNSP) di bidang digital marketing dan content creator, serta membekali siswa dengan portofolio karya nyata sejak dini.

**Misi.** (1) Menyediakan akses pendidikan berkualitas yang fleksibel dan terjangkau; (2) membekali siswa dengan keterampilan digital yang relevan dengan industri; (3) menghubungkan siswa dengan sertifikasi kompetensi yang diakui nasional; (4) membangun ekosistem tempat siswa belajar, berkarya, dan menjual karyanya; (5) memberdayakan orang tua sebagai mitra dalam proses pendidikan.

**Unique Value Proposition.** *"Lulus dengan Ijazah PKBM + Sertifikat BNSP + Portofolio Karya."*

---

## 4. Sasaran Produk & Metrik Keberhasilan

Bagian ini belum ada pada draft awal dan penting untuk mengukur keberhasilan MVP secara objektif.

### 4.1 North Star Metric
**Jumlah siswa yang mencapai status "Portfolio-Ready" per kohort**, yaitu siswa yang telah (a) menyelesaikan minimal satu kelas soft skill dan (b) mempublikasikan minimal satu karya di portofolio. Metrik ini dipilih karena secara langsung merepresentasikan inti UVP — siswa yang benar-benar berkarya, bukan sekadar mendaftar.

### 4.2 Metrik Pendukung (kerangka AARRR)
| Tahap | Metrik | Target awal (indikatif) |
|-------|--------|--------------------------|
| Acquisition | Pendaftaran siswa baru / bulan | ditetapkan setelah baseline |
| Activation | % siswa menyelesaikan onboarding & memulai ≥1 modul dalam 7 hari | ≥ 60% |
| Engagement | Weekly Active Learners (WAL) | tren naik MoM |
| Engagement | Rata-rata sesi belajar bermakna / siswa / minggu | ≥ 3 |
| Retention | Retensi siswa aktif D30 | ≥ 40% |
| Revenue | Konversi pendaftar → berlangganan berbayar | ≥ 15% |
| Value | Siswa Portfolio-Ready / total siswa aktif | ≥ 30% dalam 6 bulan |
| AI | % pertanyaan Guru AI terjawab tanpa eskalasi ke tutor | ≥ 70% |
| Kualitas | CSAT orang tua terhadap transparansi progres anak | ≥ 4.2/5 |

Target di atas bersifat indikatif dan wajib dikalibrasi ulang setelah 30 hari data pertama tersedia.

---

## 5. Target Pengguna (User Personas)

Setiap persona dilengkapi *Job To Be Done* (JTBD) untuk menajamkan prioritas fitur.

### Persona 1 — Siswa Dayanusa (pengguna utama)
Adit, 15 tahun, Paket C. Ingin menguasai digital marketing dan menjadi content creator; bosan dengan metode konvensional dan ingin belajar sambil berkarya.
*JTBD:* "Ketika aku belajar, aku ingin langsung membuat karya nyata yang bisa aku pamerkan dan jual, supaya aku merasa progresku berarti."

### Persona 2 — Orang Tua / Wali (pembayar & pengambil keputusan)
Ibu Rina, 42 tahun, wirausaha. Ingin anaknya memiliki ijazah resmi sekaligus keterampilan praktis; khawatir anaknya lulus tanpa bekal.
*JTBD:* "Ketika aku memilih sekolah untuk anakku, aku ingin bukti bahwa dia akan lulus dengan ijazah, sertifikat, dan keterampilan yang menjamin masa depannya."

### Persona 3 — Tutor / Instruktur (penyedia konten & penilai)
Pak Budi, 30 tahun, Digital Marketing Specialist. Ingin berbagi ilmu dan membangun reputasi sebagai pendidik praktisi.
*JTBD:* "Ketika aku mengajar, aku ingin platform yang memudahkan aku memberi tugas, menilai karya, dan menghargai keahlian praktisku."

### Persona 4 — Admin PKBM Mitra (operasional ijazah)
Bu Dewi, 40 tahun, Kepala PKBM Digy Homeschool. Ingin memperluas jangkauan siswa dan memodernisasi layanan; kesulitan mengelola siswa secara digital.
*JTBD:* "Aku ingin mengelola data siswa dan urusan ijazah dalam satu sistem tanpa administrasi manual."

### Persona 5 — Admin LSP Mitra (uji kompetensi BNSP)
Pak Eko, 45 tahun, Manajer LSP. Ingin menjangkau lebih banyak peserta uji; proses administrasinya masih manual.
*JTBD:* "Aku ingin menerima peserta uji yang sudah tervalidasi kesiapannya dan mengelola pendaftaran uji secara digital."

### Persona 6 — Admin Yayasan (pemilik ekosistem)
Mengelola seluruh operasional, mitra, mentor, dan kalender akademik lintas PKBM.
*JTBD:* "Aku ingin visibilitas penuh atas seluruh operasional dan kontrol atas konfigurasi platform."

---

## 6. Ruang Lingkup (Scope)

Bagian ini menegaskan batas MVP untuk mencegah *scope creep* — tidak ada pada draft awal.

### 6.1 Dalam Lingkup MVP (In-Scope)
Autentikasi & RBAC multi-role, dashboard siswa & orang tua, modul PKBM (konten teks/video/PDF + progres), kelas soft skill (3 kelas), sistem tugas & pengumpulan karya, portofolio (showcase publik), Guru AI (RAG), penjadwalan pribadi, forum diskusi sederhana, dan mode belajar offline (unduh materi).

### 6.2 Di Luar Lingkup MVP (Out-of-Scope, ditargetkan V2)
Marketplace transaksional penuh (jual-beli dengan pembayaran), pelaksanaan uji kompetensi BNSP online end-to-end, penerbitan sertifikat digital otomatis, rekomendasi jalur belajar berbasis AI, gamifikasi, aplikasi mobile native (iOS/Android), kelas live (video conference), dan analitik lanjutan untuk orang tua/tutor.

**Catatan penting:** portofolio pada MVP boleh menandai karya sebagai "dijual" dan menautkan ke tautan eksternal, tetapi **transaksi pembayaran di dalam platform bukan bagian MVP** karena membawa kompleksitas hukum (pajak, kepemilikan IP karya anak, perlindungan konsumen) yang perlu dikaji terpisah (lihat Risiko R-07).

---

## 7. Fitur & Prioritas (MoSCoW)

Daftar fitur Priority-1 pada draft awal diklasifikasi ulang dengan MoSCoW dan diberi **Feature ID** untuk penelusuran. Rekomendasi PM: **Must-have** membentuk *MVP Core* yang dilaunch lebih dulu; **Should-have** menjadi *Fast-Follow* dalam siklus rilis MVP yang sama bila kapasitas memungkinkan.

| ID | Fitur | Prioritas | Fase |
|----|-------|-----------|------|
| F-AUTH | Autentikasi, registrasi multi-role, reset password, RBAC | Must | MVP Core |
| F-PROFILE | Profil pengguna & keterkaitan akun orang tua–siswa | Must | MVP Core |
| F-DASH-S | Dashboard siswa (progres akademik + soft skill + portofolio) | Must | MVP Core |
| F-MODUL | Modul PKBM (Paket A/B/C, teks/video/PDF, progres) | Must | MVP Core |
| F-SKILL | Kelas soft skill (Digital Marketing, Content Creator, Product Creator) | Must | MVP Core |
| F-TASK | Sistem tugas & pengumpulan karya + penilaian tutor | Must | MVP Core |
| F-PORTO | Portofolio siswa + showcase publik | Must | MVP Core |
| F-AI | Guru AI (chatbot RAG) | Must | MVP Core |
| F-OFFLINE | Mode belajar offline (unduh materi) | Should | MVP Core |
| F-SCHED | Penjadwalan pribadi & kalender akademik | Should | Fast-Follow |
| F-DASH-P | Dashboard orang tua (pemantauan anak) | Should | Fast-Follow |
| F-FORUM | Forum diskusi sederhana | Should | Fast-Follow |
| F-MENTOR | Sistem mentoring (chat/jadwal) | Could | Fast-Follow |
| F-NOTIF | Notifikasi (email + web push) | Should | Fast-Follow |
| F-MARKET | Marketplace transaksional | Won't (MVP) | V2 |
| F-BNSP | Uji kompetensi & sertifikat digital BNSP | Won't (MVP) | V2 |
| F-GAME | Gamifikasi (poin, lencana, leaderboard) | Won't (MVP) | V2 |
| F-MOBILE | Aplikasi mobile native | Won't (MVP) | V2 |

---

## 8. Functional Requirements (Detail Epik Kunci)

Untuk epik paling kritis, requirement ditulis sebagai *user story* + *acceptance criteria*. Epik lain merujuk deskripsi di Bagian 7 dan skema data Fase 1.

### 8.1 F-AUTH — Autentikasi & RBAC
**US-AUTH-01.** Sebagai calon pengguna, saya ingin mendaftar dengan memilih peran, agar mendapat akses sesuai peran saya.
- AC1: Peran yang tersedia saat registrasi mandiri: Siswa, Orang Tua, Tutor. Peran Admin (Yayasan/PKBM/LSP) hanya dibuat oleh Admin Yayasan.
- AC2: Registrasi siswa mewajibkan pemilihan jalur: "PKBM + Soft Skill" atau "Soft Skill Only".
- AC3: Untuk pendaftar berusia di bawah 18 tahun, akun wajib ditautkan/diverifikasi oleh akun Orang Tua sebelum dapat mengakses fitur berbayar dan Guru AI (lihat NFR privasi).
- AC4: Verifikasi email wajib sebelum akun aktif penuh.
- AC5: Kata sandi memenuhi kebijakan minimum (panjang ≥ 8, kombinasi), disimpan ter-hash (bukan plaintext).

**US-AUTH-02.** Sebagai pengguna, saya ingin mengatur ulang kata sandi via email jika lupa.
- AC: Tautan reset kedaluwarsa dalam waktu terbatas dan sekali pakai.

**US-AUTH-03.** Sebagai sistem, setiap endpoint harus menegakkan otorisasi berbasis peran (RBAC), sehingga pengguna hanya mengakses sumber daya miliknya/haknya.

### 8.2 F-MODUL — Modul PKBM
**US-MODUL-01.** Sebagai siswa, saya ingin melihat daftar modul sesuai Paket saya (A/B/C) dan mata pelajaran, agar dapat memilih materi.
- AC1: Modul difilter berdasarkan `paket_level` siswa.
- AC2: Setiap modul menampilkan status (belum/sedang/selesai) dan persentase progres.

**US-MODUL-02.** Sebagai siswa, saya ingin membuka materi dalam format teks, video, atau PDF, dan progres tercatat otomatis.
- AC1: Menyelesaikan sebuah *lesson* memperbarui `student_progress` secara otomatis.
- AC2: Materi yang ditandai *downloadable* dapat diunduh untuk mode offline.

**US-MODUL-03.** Sebagai siswa, saya ingin mengerjakan kuis pada lesson tertentu dan melihat skornya.
- AC: Skor dan status kelulusan (>= `passing_score`) tersimpan dan tampil di progres.

### 8.3 F-TASK & F-PORTO — Tugas → Karya → Portofolio
**US-TASK-01.** Sebagai siswa, saya ingin mengunggah tugas (file PDF/video/gambar atau tautan) sebelum tenggat.
- AC1: Format & ukuran file divalidasi; unggahan setelah tenggat ditandai terlambat namun tetap diterima (kebijakan dapat dikonfigurasi).
- AC2: Status submission mengikuti alur: draft → submitted → reviewed/revision → approved.

**US-TASK-02.** Sebagai tutor, saya ingin menilai submission dengan nilai dan feedback tertulis.
- AC: Nilai & feedback tampil di dashboard siswa dan (jika ditautkan) di dashboard orang tua.

**US-PORTO-01.** Sebagai siswa, saya ingin menjadikan karya terbaik sebagai entri portofolio dan mempublikasikannya.
- AC1: Karya dapat berasal dari submission yang telah *approved* atau diunggah mandiri.
- AC2: Saat dipublikasikan (`is_public = true`), karya tampil di showcase publik dengan judul, deskripsi, media, kategori, dan tanggal.
- AC3: **Perlindungan anak:** identitas siswa di showcase publik ditampilkan sebagai nama depan/nama pena dan avatar, tanpa PII sensitif (alamat, sekolah lengkap, kontak). Publikasi karya siswa di bawah 18 tahun memerlukan izin orang tua.
- AC4: Pengunjung dapat memberi "like" dan komentar sederhana; komentar melewati moderasi/penyaringan.

### 8.4 F-AI — Guru AI (RAG)
**US-AI-01.** Sebagai siswa, saya ingin bertanya kepada Guru AI tentang materi dan mendapat jawaban berbasis knowledge base Dayanusa.
- AC1: Jawaban memanfaatkan RAG dari `knowledge_chunks` (materi PKBM & soft skill) dan menampilkan indikator sumber bila relevan.
- AC2: Riwayat percakapan tersimpan per pengguna.
- AC3: **Guardrail anak:** Guru AI menolak/mengalihkan permintaan yang tidak pantas untuk anak, tidak memberi nasihat berisiko (medis/hukum/keuangan) tanpa disclaimer, dan mengarahkan ke tutor/orang tua untuk hal sensitif. Prompt sistem mengunci persona sebagai pendamping belajar yang aman.
- AC4: Bila keyakinan jawaban rendah atau di luar knowledge base, AI menyatakan ketidaktahuannya dan menawarkan eskalasi ke tutor/forum, bukan mengarang.

### 8.5 F-DASH-P — Dashboard Orang Tua
**US-DASH-P-01.** Sebagai orang tua yang akunnya tertaut ke siswa, saya ingin memantau progres akademik & soft skill, nilai/feedback tugas, portofolio, dan aktivitas terakhir anak.
- AC: Orang tua hanya dapat melihat data anak yang tertaut ke akunnya (RBAC).

---

## 9. User Flow (Alur Pengguna)

Alur inti berikut dipertahankan dari draft awal (diringkas); menjadi acuan desain UI Fase 4.

1. **Registrasi Siswa Baru:** landing page → Daftar → pilih peran Siswa → isi data → pilih jalur → verifikasi email → (tautkan akun orang tua bila <18) → Dashboard.
2. **Belajar Modul PKBM:** Dashboard → Modul PKBM → pilih Paket → pilih mapel → konsumsi materi → kuis → progres tercatat.
3. **Kelas Soft Skill:** Dashboard → Kelas → pilih kelas → tonton video & baca modul → kerjakan tugas praktik → unggah → feedback tutor → karya masuk portofolio.
4. **Guru AI:** Dashboard → Guru AI → tanya → jawaban RAG → percakapan lanjutan → riwayat tersimpan.
5. **Bangun Portofolio:** Dashboard → Portofolio Saya → Tambah Karya → isi & unggah → pilih kategori → publikasikan (dengan izin orang tua bila <18).
6. **Mentoring:** Dashboard → Mentoring → pilih mentor → kirim permintaan → konfirmasi mentor → sesi (chat/jadwal) → tercatat di kalender.
7. **Uji Kompetensi BNSP (V2):** selesai materi → notifikasi "Siap Uji" → daftar via admin LSP → bayar (bila ada) → ikuti uji → hasil → sertifikat digital di dashboard.
8. **Orang Tua Memantau:** login → Dashboard Orang Tua → progres, nilai/feedback, portofolio, aktivitas terakhir, notifikasi.

---

## 10. Non-Functional Requirements (NFR)

Bagian ini krusial dan belum ada pada draft awal.

| Kategori | Persyaratan |
|----------|-------------|
| Performa | Waktu muat halaman utama < 3 detik pada koneksi 4G; respons API p95 < 500 ms untuk operasi umum. |
| Skalabilitas | Arsitektur mendukung penskalaan horizontal backend (stateless + JWT); basis data dapat menampung pertumbuhan kohort. |
| Ketersediaan | Target uptime ≥ 99.5% untuk MVP. |
| Keamanan | Kata sandi ter-hash; transport TLS; JWT (access + refresh); RBAC di setiap endpoint; validasi input; proteksi terhadap OWASP Top 10. |
| Privasi & Kepatuhan | Tunduk pada UU No. 27/2022 (PDP). Data anak diminimalkan; **persetujuan orang tua** untuk pemrosesan data anak <18 & untuk publikasi karya; hak akses/koreksi/hapus data. |
| Keamanan Anak | Showcase publik tanpa PII sensitif anak; moderasi komentar; guardrail Guru AI; pelaporan konten. |
| Aksesibilitas | Target WCAG 2.1 AA (kontras, navigasi keyboard, teks alternatif). |
| Responsif | Mobile-first; PWA (installable, offline shell). |
| Offline | Materi ber-flag *downloadable* dapat diakses tanpa internet; sinkronisasi progres saat online kembali. |
| Lokalisasi | Bahasa Indonesia sebagai bahasa utama; struktur siap i18n. |
| Observability | Logging terpusat, error tracking, dan audit trail untuk aksi admin. |
| Backup | Backup basis data terjadwal dengan uji pemulihan berkala. |

---

## 11. Spesifikasi Teknis (High-Level)

Melengkapi bagian yang terpotong pada draft awal; selaras dengan arsitektur yang telah dirancang pada Fase 1.

### 11.1 Platform
Web-based, responsif, mobile-first, dikemas sebagai Progressive Web App (PWA) agar terasa seperti aplikasi native dan mendukung mode offline.

### 11.2 Arsitektur Sistem
- **Frontend:** Next.js (App Router) + Tailwind CSS — SSR & SEO friendly. Deploy di Vercel.
- **Backend:** Python FastAPI + SQLAlchemy 2.0 (async) dengan dependency injection & autentikasi JWT. Deploy di Railway/Render.
- **Basis Data:** PostgreSQL 16 dengan ekstensi `pgvector` untuk penyimpanan embedding RAG.
- **AI:** Google Gemini API atau OpenAI GPT-4, dapat ditukar melalui konfigurasi `AI_PROVIDER` (dimensi embedding berbeda: Gemini 768 vs OpenAI 1536 — dikunci sejak awal).
- **Storage:** Cloud object storage (Supabase Storage / S3 / GCS) untuk materi & portofolio.
- **API:** RESTful, berversi (`/api/v1`), dokumentasi otomatis via OpenAPI/Swagger.

### 11.3 Arsitektur AI (RAG)
Pipeline: materi (lesson/skill/FAQ) → chunking → embedding → simpan di `knowledge_chunks` (pgvector). Saat siswa bertanya: pertanyaan di-embed → pencarian kemiripan → konteks teratas dirangkai ke prompt → LLM menjawab dengan mengutip sumber. Guardrail keamanan anak ditanam pada prompt sistem dan lapisan penyaringan. (Detail implementasi & prompt engineering dibahas pada Fase 5.)

### 11.4 Notifikasi
Email (transaksional: verifikasi, reset, feedback tugas) + web push (PWA) untuk pengingat jadwal dan tenggat tugas.

### 11.5 Data Model
Mengacu pada 26 tabel dalam 8 domain yang telah dirancang (lihat `docs/DATABASE_SCHEMA.md`): User & Organisasi, Akademik PKBM, Soft Skill, Portofolio, AI/RAG, Jadwal, Forum, Mentoring & Sertifikasi.

---

## 12. Data, Analitik & Tracking Plan

Peristiwa kunci yang dilacak untuk mengukur metrik Bagian 4 (nama event indikatif): `user_registered`, `onboarding_completed`, `module_started`, `lesson_completed`, `quiz_submitted`, `assignment_submitted`, `assignment_graded`, `portfolio_published`, `ai_message_sent`, `ai_escalated_to_tutor`, `mentoring_requested`, `subscription_started`. Setiap event menyertakan properti minimal (peran, jalur, timestamp) tanpa menyimpan PII sensitif anak pada layer analitik. Alat analitik ditentukan pada fase implementasi (mis. GA4/PostHog) dengan konfigurasi yang menghormati privasi anak.

---

## 13. Model Bisnis & Monetisasi (Proposal)

Belum ada pada draft awal; berikut hipotesis yang perlu divalidasi dengan riset harga.

| Aliran Pendapatan | Deskripsi | Fase |
|-------------------|-----------|------|
| Langganan Soft Skill Only | Akses kelas vokasi + portofolio + Guru AI | MVP |
| Langganan Full (PKBM + Soft Skill) | Paket gabungan formal + vokasi | MVP |
| Biaya Uji Kompetensi BNSP | Sekali bayar per uji (bagi hasil dengan LSP) | V2 |
| Komisi Marketplace | Persentase dari penjualan karya siswa | V2 |
| Biaya Mentoring Premium | Sesi dengan praktisi industri terpilih | V2 |

Keputusan struktur & besaran harga adalah *open question* (lihat Bagian 16) dan bergantung pada model kemitraan dengan PKBM dan LSP.

---

## 14. Rencana Rilis & Roadmap (Target MVP 3–6 Bulan)

| Milestone | Fokus | Cakupan | Perkiraan |
|-----------|-------|---------|-----------|
| M0 — Fondasi | Setup arsitektur | Struktur proyek, skema DB, CI/CD, lingkungan | Selesai/berjalan (Fase 1) |
| M1 — Core Backend & Auth | F-AUTH, F-PROFILE | Auth JWT, RBAC, akun orang tua–siswa, migrasi DB | Bulan 1–2 |
| M2 — Belajar Inti | F-MODUL, F-SKILL, F-DASH-S | Konten PKBM & soft skill, progres, dashboard siswa | Bulan 2–3 |
| M3 — Karya & AI | F-TASK, F-PORTO, F-AI, F-OFFLINE | Tugas, portofolio publik, Guru AI (RAG), mode offline | Bulan 3–5 |
| M4 — Pendukung & Launch | F-SCHED, F-DASH-P, F-FORUM, F-NOTIF | Jadwal, dashboard orang tua, forum, notifikasi, hardening | Bulan 5–6 |
| MVP Launch | Rilis terbatas | Onboarding kohort pertama | Bulan 6 |

*Definition of Done* setiap milestone: fitur lolos acceptance criteria, teruji (unit/integrasi), memenuhi NFR keamanan & privasi anak yang relevan, dan terdokumentasi.

---

## 15. Dependensi & Asumsi

**Dependensi:** perjanjian kemitraan dengan PKBM (untuk ijazah) dan LSP (untuk BNSP); ketersediaan konten kurikulum PKBM & materi soft skill berbasis SKKNI; kuota/akses API penyedia AI; penyedia cloud storage & gateway pembayaran (untuk fase berbayar).

**Asumsi:** siswa memiliki perangkat & koneksi internet yang memadai (dengan mode offline sebagai mitigasi); orang tua bersedia menjadi wali akun dan memberi persetujuan data; kurikulum soft skill dapat dipetakan ke unit SKKNI yang relevan; target waktu 3–6 bulan mengasumsikan MVP Core sebagai lingkup rilis pertama.

---

## 16. Risiko & Mitigasi (Risk Register)

| ID | Risiko | Dampak | Mitigasi |
|----|--------|--------|----------|
| R-01 | Kelayakan usia peserta uji BNSP bagi anak <18 belum pasti | Tinggi | Klarifikasi persyaratan dengan LSP/BNSP lebih awal; posisikan BNSP sebagai jalur V2 dan bisa ditunda per-usia. |
| R-02 | Privasi & keamanan data anak (UU PDP) | Tinggi | Minimalkan data; consent orang tua; showcase tanpa PII sensitif; audit kepatuhan sebelum launch. |
| R-03 | Guru AI memberi jawaban keliru/tidak pantas ke anak | Tinggi | Guardrail prompt, penyaringan, indikasi sumber, eskalasi ke tutor, uji red-team sebelum rilis. |
| R-04 | Ketergantungan pada satu penyedia AI (biaya/lock-in) | Sedang | Abstraksi provider (`AI_PROVIDER`) agar dapat berpindah Gemini/GPT. |
| R-05 | Bottleneck produksi konten kurikulum | Sedang | Prioritaskan konten untuk 1 Paket & 1 kelas soft skill saat launch; jadwalkan produksi bertahap. |
| R-06 | Scope creep MVP (fitur Priority-1 terlalu luas) | Sedang | Pemisahan MVP Core vs Fast-Follow (Bagian 7); disiplin DoD. |
| R-07 | Kompleksitas hukum marketplace karya anak (pajak, IP, konsumen) | Sedang | Tunda transaksi in-app ke V2; MVP hanya tautan eksternal; kaji hukum terpisah. |
| R-08 | Ketergantungan kesiapan mitra PKBM/LSP | Sedang | Finalisasi MoU & alur data mitra sebelum M2; siapkan rencana kontinjensi mitra. |

---

## 17. Open Questions (Keputusan yang Menunggu)

1. Berapa usia minimum dan prasyarat peserta uji kompetensi BNSP? (mempengaruhi R-01 & fase F-BNSP)
2. Provider AI final: Gemini atau GPT-4? (mengunci dimensi embedding pgvector)
3. Gateway pembayaran & model harga langganan final?
4. Siapa pemilik hak kekayaan intelektual atas karya siswa yang dijual, dan bagaimana penanganan transaksinya?
5. Sejauh mana integrasi sistem LSP/PKBM pada MVP vs proses manual sementara?
6. Cakupan moderasi konten forum & komentar (manual vs otomatis) pada MVP?

---

## 18. Lampiran — Glosarium

**PKBM** Pusat Kegiatan Belajar Masyarakat, penyelenggara pendidikan kesetaraan. · **Paket A/B/C** program kesetaraan setara SD/SMP/SMA. · **BNSP** Badan Nasional Sertifikasi Profesi. · **LSP** Lembaga Sertifikasi Profesi (mitra pelaksana uji BNSP). · **SKKNI** Standar Kompetensi Kerja Nasional Indonesia. · **RAG** Retrieval Augmented Generation. · **RBAC** Role-Based Access Control. · **UVP** Unique Value Proposition. · **NSM** North Star Metric. · **AARRR** kerangka metrik Acquisition/Activation/Retention/Revenue/Referral. · **PWA** Progressive Web App. · **UU PDP** Undang-Undang Pelindungan Data Pribadi (No. 27/2022). · **JTBD** Jobs To Be Done. · **DoD** Definition of Done.

---

*Dokumen ini adalah artefak produk yang hidup dan akan diperbarui seiring validasi asumsi, keputusan atas open questions, dan umpan balik pengguna.*
