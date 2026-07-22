"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listSessions, createSession, deleteSession, getHistory, getSuggestions, streamMessage,
} from "@/lib/chat";
import { useToast } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Markdown from "@/components/chat/Markdown";
import TypingIndicator from "@/components/chat/TypingIndicator";
import type { ChatMessage, ChatSession } from "@/types";

const CONTEXT_CHIPS = [
  "PKBM",
  "Soft Skill",
  "Tugas",
  "Portofolio",
];

const PROMPT_PRESETS = [
  {
    title: "Minta ringkasan materi",
    prompt: "Ringkas materi ini jadi poin-poin inti yang mudah dipahami siswa.",
  },
  {
    title: "Bikin latihan cepat",
    prompt: "Buatkan 5 soal latihan singkat beserta jawabannya.",
  },
  {
    title: "Jelaskan lebih sederhana",
    prompt: "Jelaskan materi ini dengan bahasa yang lebih sederhana dan contoh nyata.",
  },
  {
    title: "Bantu tugas",
    prompt: "Bantu saya menyusun langkah mengerjakan tugas ini dengan rapi.",
  },
];

function ChatPage() {
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params.get("session");
  const { show } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  const refreshSessions = useCallback(async () => {
    try { setSessions(await listSessions()); } catch { /* diam */ }
  }, []);

  // muat sesi + saran di awal
  useEffect(() => {
    refreshSessions();
    getSuggestions().then((s) => setSuggestions(s.suggestions)).catch(() => {});
  }, [refreshSessions]);

  // muat riwayat saat sesi aktif berubah
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let alive = true;
    setLoadingHistory(true);
    getHistory(activeId)
      .then((m) => { if (alive) { setMessages(m); scrollToBottom(); } })
      .catch(() => show("Gagal memuat riwayat.", "error"))
      .finally(() => alive && setLoadingHistory(false));
    return () => { alive = false; };
  }, [activeId, scrollToBottom, show]);

  useEffect(() => { scrollToBottom(); }, [messages, streamText, scrollToBottom]);

  function selectSession(id: string) {
    if (id !== activeId) router.replace(`/student/chat?session=${id}`);
  }

  async function newChat() {
    try {
      const s = await createSession();
      await refreshSessions();
      router.replace(`/student/chat?session=${s.id}`);
      setMessages([]);
    } catch { show("Gagal membuat sesi baru.", "error"); }
  }

  async function removeSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Hapus percakapan ini?")) return;
    try {
      await deleteSession(id);
      await refreshSessions();
      if (id === activeId) router.replace("/student/chat");
    } catch { show("Gagal menghapus sesi.", "error"); }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || streaming) return;
    setInput("");

    // pastikan ada sesi aktif
    let sid = activeId;
    if (!sid) {
      try {
        const s = await createSession();
        sid = s.id;
        await refreshSessions();
        router.replace(`/student/chat?session=${s.id}`);
      } catch { show("Gagal memulai percakapan.", "error"); return; }
    }

    // tampilkan pesan user secara optimistis
    const temp: ChatMessage = {
      id: `tmp-${Date.now()}`, session_id: sid!, role: "user", content: message, created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, temp]);
    setStreaming(true);
    setStreamText("");

    try {
      await streamMessage(sid!, message, (delta) => setStreamText((t) => t + delta));
      // sinkronkan dengan server (dapat ID asli + judul sesi terbarui)
      const [hist] = await Promise.all([getHistory(sid!), refreshSessions()]);
      setMessages(hist);
      setStreamText("");
    } catch (err) {
      setStreamText("");
      show(err instanceof Error ? err.message : "Gagal menghubungi Guru AI.", "error");
    } finally {
      setStreaming(false);
    }
  }

  const empty = !activeId || (messages.length === 0 && !streaming && !loadingHistory);
  const promptChips = useMemo(()=>{
    const dynamicPrompts = suggestions.slice(0,4).map((item)=>({ title:item, prompt:item }));
    return [...PROMPT_PRESETS, ...dynamicPrompts].slice(0,8);
  },[suggestions]);
  const activeSession = sessions.find((session)=>session.id===activeId) ?? null;
  const contextSummary = activeSession?.last_message
    ? `Topik aktif: ${activeSession.last_message}`
    : empty
      ? "Belum ada sesi aktif. Mulai dengan prompt cepat agar Guru AI langsung punya konteks."
      : "Percakapan aktif siap dilanjutkan dari pesan terakhir.";
  const suggestedModeText = streaming
    ? "Guru AI sedang merangkai jawaban berdasarkan konteks materi Dayanusa."
    : empty
      ? "Gunakan prompt cepat di bawah untuk memulai arah belajar."
      : "Pertajam pertanyaanmu dengan konteks tugas, materi, atau target pemahaman.";
  function usePrompt(prompt: string, sendNow = false) {
    if (sendNow) {
      void send(prompt);
      return;
    }
    setInput(prompt);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Sidebar sesi */}
      <aside className="rounded-xl2 border border-navy-100 bg-white p-3 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <div className="mb-3 rounded-[24px] border border-gold-100 bg-gradient-to-br from-gold-50 via-white to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Workspace Guru AI</p>
          <h2 className="mt-2 text-base font-semibold text-navy-900">Copilot belajar yang selalu siap lanjut dari konteksmu</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-white px-3 py-2">
              <p className="font-semibold text-navy-900">{sessions.length}</p>
              <p className="mt-1 text-navy-500">Percakapan</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2">
              <p className="font-semibold text-navy-900">{messages.length}</p>
              <p className="mt-1 text-navy-500">Pesan aktif</p>
            </div>
          </div>
        </div>
        <button onClick={newChat} className="mb-3 w-full rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600">+ Chat Baru</button>
        <div className="space-y-1">
          {sessions.length === 0 && <p className="px-2 py-4 text-center text-xs text-navy-500">Belum ada percakapan.</p>}
          {sessions.map((s) => (
            <div key={s.id} onClick={() => selectSession(s.id)}
              className={`group flex cursor-pointer items-start justify-between gap-2 rounded-xl px-3 py-2 text-sm ${s.id === activeId ? "bg-navy-50" : "hover:bg-navy-50"}`}>
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-900">{s.title}</p>
                {s.last_message && <p className="truncate text-xs text-navy-500">{s.last_message}</p>}
              </div>
              <button onClick={(e) => removeSession(s.id, e)} aria-label="Hapus sesi"
                className="opacity-0 transition-opacity group-hover:opacity-100 text-navy-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      </aside>

      {/* Panel chat */}
      <section className="flex flex-col rounded-xl2 border border-navy-100 bg-white lg:h-[calc(100vh-8rem)]">
        <div className="border-b border-navy-100 px-5 py-4">
          <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold">AI</div>
            <div><p className="font-semibold text-navy-900">Guru AI Dayanusa</p><p className="text-xs text-navy-500">Pendamping belajar 24 jam</p></div>
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-navy-100 bg-navy-50/50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Context bar</p>
              <p className="mt-1 text-sm font-semibold text-navy-900">{activeSession?.title ?? "Siap memulai sesi baru"}</p>
              <p className="mt-1 text-xs leading-5 text-navy-600">{contextSummary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTEXT_CHIPS.map((chip)=><Badge key={chip} tone="navy">{chip}</Badge>)}
              <Badge tone={streaming ? "gold" : "green"}>{streaming ? "Sedang menjawab" : "Siap membantu"}</Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {loadingHistory && <Spinner label="Memuat riwayat…" />}

          {empty && !loadingHistory && (
            <div className="mx-auto max-w-lg py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-gold">AI</div>
              <h2 className="text-lg font-bold text-navy-900">Halo! Mau belajar apa hari ini?</h2>
              <p className="mt-1 text-sm text-navy-600">Tanya apa saja tentang pelajaran PKBM, keterampilan digital, tugas, atau strategi belajar yang lebih efektif.</p>
              <div className="mt-5 rounded-[24px] border border-gold-100 bg-gold-50/60 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Prompt cepat</p>
                <div className="mt-3 grid gap-2">
                  {promptChips.slice(0,6).map((item) => (
                    <button key={item.title} onClick={() => usePrompt(item.prompt, true)} className="rounded-xl border border-white bg-white px-4 py-2.5 text-left text-sm text-navy-800 transition hover:border-gold hover:bg-gold-50">
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!empty && !loadingHistory && (
            <div className="rounded-[22px] border border-navy-100 bg-navy-50/45 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Saran berikutnya</p>
                  <p className="mt-1 text-sm text-navy-600">{suggestedModeText}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {promptChips.slice(0,4).map((item)=>(
                    <button
                      key={item.title}
                      onClick={()=>usePrompt(item.prompt)}
                      className="rounded-full border border-navy-100 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:border-gold hover:bg-gold-50"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)}

          {streaming && (
            <div className="flex gap-3">
              <Avatar role="assistant" />
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-navy-50 px-4 py-2.5 text-sm text-navy-900">
                {streamText ? <Markdown content={streamText} /> : <TypingIndicator />}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 border-t border-navy-100 bg-white/95 p-3 backdrop-blur sm:p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {promptChips.slice(0,4).map((item)=>(
              <button
                key={item.title}
                onClick={()=>usePrompt(item.prompt)}
                className="rounded-full border border-navy-100 bg-navy-50/50 px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:border-gold hover:bg-gold-50"
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-navy-100 bg-navy-50/50 px-4 py-3 text-xs text-navy-600">
            <p>{streaming ? "Guru AI sedang memproses pertanyaanmu dengan konteks percakapan aktif." : "Composer tetap terlihat agar kamu bisa lanjut belajar tanpa kehilangan konteks."}</p>
            <Badge tone="navy">Enter kirim</Badge>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Tulis pertanyaanmu… (Enter kirim, Shift+Enter baris baru)"
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
            <button onClick={() => send(input)} disabled={streaming || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white hover:bg-navy-600 disabled:opacity-50" aria-label="Kirim">
              {streaming ? <span className="spinner inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> : "➤"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  return role === "assistant"
    ? <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold">AI</div>
    : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy-900">You</div>;
}

function Bubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={isUser ? "user" : "assistant"} />
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "rounded-tr-sm bg-navy-900 text-white" : "rounded-tl-sm bg-navy-50 text-navy-900"}`}>
        {isUser ? <p className="whitespace-pre-wrap">{content}</p> : <Markdown content={content} />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ChatPage />
    </Suspense>
  );
}
