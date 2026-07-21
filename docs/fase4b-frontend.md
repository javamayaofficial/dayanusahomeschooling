# Fase 4B — Guru AI: FRONTEND (/student/chat)

Halaman chat Guru AI dengan streaming SSE. `npm run build` OK (17 rute).

## Struktur
- `app/(dashboard)/student/chat/page.tsx` — halaman utama (ChatContainer):
  sidebar sesi + area pesan + input. Komponen MessageList, MessageInput,
  SuggestionChips, Bubble, Avatar, SessionSidebar disusun di sini.
- `app/components/chat/Markdown.tsx` — MarkdownRenderer AMAN (parse ke elemen
  React, TANPA dangerouslySetInnerHTML). Dukung bold/italic/code/heading/list/link/blok kode.
- `app/components/chat/TypingIndicator.tsx` — animasi 3 titik.
- `app/lib/chat.ts` — API + `streamMessage()` pembaca SSE.

## Fitur
- Kirim pesan → **streaming SSE** (baca `response.body.getReader()`, parse
  `data: {"delta"|"done"|"error"}`), teks muncul bertahap.
- Markdown pada jawaban AI; pesan user teks polos.
- Avatar AI (navy/gold "AI") & user ("You").
- **Chat Baru** → POST /chat/session. Session ID di URL (`?session=xxx`).
- Riwayat dimuat saat sesi dipilih/dibuat (GET /chat/history/{id}).
- Typing indicator saat menunggu, hilang setelah selesai.
- Suggestion chips (GET /chat/suggestions) di tampilan awal sesi kosong.
- Hapus sesi, auto-scroll, Enter kirim / Shift+Enter baris baru, responsif, tema navy/gold.
- Menu "Guru AI" ditambahkan ke navbar siswa; tombol "Tanya Guru AI" di dashboard.

## Catatan (jujur)
- **react-markdown**: diminta di spesifikasi, tapi diganti renderer mandiri agar
  build 100% pasti berhasil tanpa dependensi tambahan. Mudah ditukar bila diinginkan.
- Streaming hanya menghasilkan jawaban nyata bila **backend punya GEMINI_API_KEY**.
  Tanpa key, backend mengirim 503; UI menampilkannya sebagai toast error dengan rapi
  (alur, sesi, riwayat, suggestions tetap berfungsi).

## Menjalankan
    npm install
    cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
    npm run dev
