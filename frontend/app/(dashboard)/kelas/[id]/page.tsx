"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSoftSkill, markProgress } from "@/lib/learning";
import { useToast } from "@/lib/toast";
import LessonViewer from "@/components/LessonViewer";
import Spinner from "@/components/ui/Spinner";
import type { SkillClassDetail } from "@/types";
const T:Record<string,string>={text:"Teks",video:"Video",pdf:"PDF",link:"Tautan"};
export default function KelasDetailPage() {
  const { id } = useParams<{id:string}>(); const { show } = useToast();
  const [c,setC]=useState<SkillClassDetail|null>(null); const [err,setErr]=useState<string|null>(null);
  const [done,setDone]=useState<Record<string,boolean>>({}); const [busy,setBusy]=useState<string|null>(null);
  const [activeId,setActiveId]=useState<string|null>(null);
  useEffect(()=>{ getSoftSkill(id).then(setC).catch(()=>setErr("Kelas tidak ditemukan.")); },[id]);
  useEffect(()=>{ if (c?.lessons.length && !activeId) setActiveId(c.lessons[0]?.id ?? null); },[c,activeId]);
  async function complete(lid:string){ setBusy(lid);
    try { await markProgress("skill_lesson", lid); setDone(d=>({...d,[lid]:true})); show("Progres tersimpan","success"); }
    catch { show("Gagal menyimpan progres","error"); } finally { setBusy(null); } }
  if (err) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>;
  if (!c) return <Spinner />;
  const activeLesson = c.lessons.find((lesson)=>lesson.id===activeId) ?? c.lessons[0] ?? null;
  return (<div>
    <Link href="/kelas" className="text-sm text-navy-600 hover:underline">← Kembali ke kelas</Link>
    <h1 className="mt-3 text-2xl font-bold text-navy-900">{c.title}</h1>
    {c.skkni_code && <p className="mt-1 text-xs text-navy-600">Referensi: {c.skkni_code}</p>}
    {c.description && <p className="mt-3 text-navy-600">{c.description}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        {activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            lessonNumber={c.lessons.findIndex((lesson)=>lesson.id===activeLesson.id)+1}
            completed={Boolean(done[activeLesson.id])}
            busy={busy===activeLesson.id}
            onComplete={()=>complete(activeLesson.id)}
          />
        ) : (
          <div className="rounded-[28px] border border-dashed border-navy-200 bg-white p-6 text-sm text-navy-600">
            Materi untuk kelas ini belum tersedia.
          </div>
        )}
      </div>
      <aside className="rounded-[28px] border border-navy-100 bg-white p-4 shadow-soft">
        <div className="px-2 pb-3">
          <h2 className="text-lg font-semibold text-navy-900">Daftar materi</h2>
          <p className="mt-1 text-sm text-navy-600">{c.lessons.length} materi tersedia</p>
        </div>
        <ol className="space-y-3">
          {c.lessons.map((l,i)=>(<li key={l.id}>
            <button onClick={()=>setActiveId(l.id)} className={`w-full rounded-2xl border p-4 text-left transition ${activeLesson?.id===l.id?"border-gold-400 bg-gold-50/60":"border-navy-100 bg-white hover:bg-navy-50"}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${activeLesson?.id===l.id?"bg-gold-100 text-gold-800":"bg-navy-50 text-navy-600"}`}>{i+1}</span>
                <div className="min-w-0">
                  <p className="font-medium text-navy-900">{l.title}</p>
                  <p className="mt-1 text-xs text-navy-600">{T[l.content_type]}{l.duration_minutes?` · ${l.duration_minutes} menit`:""}</p>
                  <p className={`mt-2 text-xs font-semibold ${done[l.id]?"text-emerald-700":"text-navy-500"}`}>{done[l.id]?"Sudah selesai":"Belum selesai"}</p>
                </div>
              </div>
            </button>
          </li>))}
        </ol>
      </aside>
    </div></div>);
}
