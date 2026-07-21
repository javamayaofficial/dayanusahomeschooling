"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMyProgress, getSoftSkill, markProgress } from "@/lib/learning";
import { useToast } from "@/lib/toast";
import LessonViewer from "@/components/LessonViewer";
import Spinner from "@/components/ui/Spinner";
import type { SkillClassDetail } from "@/types";
const T:Record<string,string>={text:"Teks",video:"Video",pdf:"PDF",link:"Tautan"};
const RESUME_KEY = "skill-active-lesson:";
export default function KelasDetailPage() {
  const { id } = useParams<{id:string}>(); const { show } = useToast();
  const [c,setC]=useState<SkillClassDetail|null>(null); const [err,setErr]=useState<string|null>(null);
  const [done,setDone]=useState<Record<string,boolean>>({}); const [busy,setBusy]=useState<string|null>(null);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [resumed,setResumed]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    setErr(null); setC(null); setDone({}); setActiveId(null); setResumed(false);
    Promise.all([getSoftSkill(id), getMyProgress().catch(()=>[])])
      .then(([skillClass, progress])=>{
        if (cancelled) return;
        const completed = Object.fromEntries(
          progress.filter((item)=>item.content_kind==="skill_lesson" && item.status==="completed").map((item)=>[item.content_id,true]),
        );
        const resumeId = typeof window!=="undefined" ? window.localStorage.getItem(`${RESUME_KEY}${id}`) : null;
        const lessonIds = new Set(skillClass.lessons.map((lesson)=>lesson.id));
        const defaultId = skillClass.lessons.find((lesson)=>!completed[lesson.id])?.id ?? skillClass.lessons[0]?.id ?? null;
        const nextActiveId = resumeId && lessonIds.has(resumeId) ? resumeId : defaultId;
        setC(skillClass); setDone(completed); setActiveId(nextActiveId); setResumed(Boolean(resumeId && lessonIds.has(resumeId)));
      })
      .catch(()=>setErr("Kelas tidak ditemukan."));
    return ()=>{ cancelled=true; };
  },[id]);
  useEffect(()=>{ if (activeId && typeof window!=="undefined") window.localStorage.setItem(`${RESUME_KEY}${id}`, activeId); },[id,activeId]);
  async function complete(lid:string){ setBusy(lid);
    try { await markProgress("skill_lesson", lid); setDone(d=>({...d,[lid]:true})); show("Progres tersimpan","success"); }
    catch { show("Gagal menyimpan progres","error"); } finally { setBusy(null); } }
  if (err) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>;
  if (!c) return <Spinner />;
  const activeLesson = c.lessons.find((lesson)=>lesson.id===activeId) ?? c.lessons[0] ?? null;
  const activeIndex = activeLesson ? c.lessons.findIndex((lesson)=>lesson.id===activeLesson.id) : -1;
  const prevLesson = activeIndex>0 ? c.lessons[activeIndex-1] : null;
  const nextLesson = activeIndex>=0 && activeIndex<c.lessons.length-1 ? c.lessons[activeIndex+1] : null;
  const completedCount = c.lessons.filter((lesson)=>done[lesson.id]).length;
  const percent = c.lessons.length ? Math.round((completedCount/c.lessons.length)*100) : 0;
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
            totalLessons={c.lessons.length}
            completedLessons={completedCount}
            completed={Boolean(done[activeLesson.id])}
            busy={busy===activeLesson.id}
            onComplete={()=>complete(activeLesson.id)}
            onPrev={prevLesson ? ()=>setActiveId(prevLesson.id) : undefined}
            onNext={nextLesson ? ()=>setActiveId(nextLesson.id) : undefined}
            hasPrev={Boolean(prevLesson)}
            hasNext={Boolean(nextLesson)}
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
          <p className="mt-1 text-sm text-navy-600">{c.lessons.length} materi tersedia · {completedCount} selesai</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-navy-700" style={{width:`${percent}%`}} />
          </div>
          <p className="mt-2 text-xs font-medium text-navy-500">{percent}% progres kelas</p>
          {resumed && <p className="mt-2 text-xs font-semibold text-gold-700">Melanjutkan dari materi terakhir yang dibuka.</p>}
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
                  {activeLesson?.id===l.id && <p className="mt-1 text-[11px] font-semibold text-gold-700">Sedang dibuka</p>}
                </div>
              </div>
            </button>
          </li>))}
        </ol>
      </aside>
    </div></div>);
}
