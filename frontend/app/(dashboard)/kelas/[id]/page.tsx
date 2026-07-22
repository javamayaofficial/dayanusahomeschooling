"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMyProgress, getSoftSkill, markProgress } from "@/lib/learning";
import { getAssignments, isOverdue, tabOf } from "@/lib/assignments";
import { useToast } from "@/lib/toast";
import LessonViewer from "@/components/LessonViewer";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import type { Assignment, SkillClassDetail } from "@/types";
const T:Record<string,string>={text:"Teks",video:"Video",pdf:"PDF",link:"Tautan"};
const RESUME_KEY = "skill-active-lesson:";
type DetailTab = "materi"|"tugas";
function fmt(iso?:string|null){ return iso ? new Date(iso).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "Tanpa tenggat"; }
export default function KelasDetailPage() {
  const { id } = useParams<{id:string}>(); const { show } = useToast();
  const [c,setC]=useState<SkillClassDetail|null>(null); const [err,setErr]=useState<string|null>(null);
  const [done,setDone]=useState<Record<string,boolean>>({}); const [busy,setBusy]=useState<string|null>(null);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [resumed,setResumed]=useState(false);
  const [activeTab,setActiveTab]=useState<DetailTab>("materi");
  const [assignments,setAssignments]=useState<Assignment[]|null>(null);
  const [assignmentError,setAssignmentError]=useState<string|null>(null);
  useEffect(()=>{
    let cancelled=false;
    setErr(null); setC(null); setDone({}); setActiveId(null); setResumed(false); setAssignments(null); setAssignmentError(null); setActiveTab("materi");
    Promise.all([getSoftSkill(id), getMyProgress().catch(()=>[]), getAssignments().catch(()=>null)])
      .then(([skillClass, progress, taskItems])=>{
        if (cancelled) return;
        const completed = Object.fromEntries(
          progress.filter((item)=>item.content_kind==="skill_lesson" && item.status==="completed").map((item)=>[item.content_id,true]),
        );
        const resumeId = typeof window!=="undefined" ? window.localStorage.getItem(`${RESUME_KEY}${id}`) : null;
        const lessonIds = new Set(skillClass.lessons.map((lesson)=>lesson.id));
        const defaultId = skillClass.lessons.find((lesson)=>!completed[lesson.id])?.id ?? skillClass.lessons[0]?.id ?? null;
        const nextActiveId = resumeId && lessonIds.has(resumeId) ? resumeId : defaultId;
        setC(skillClass); setDone(completed); setActiveId(nextActiveId); setResumed(Boolean(resumeId && lessonIds.has(resumeId)));
        if (taskItems === null) {
          setAssignments([]);
          setAssignmentError("Tugas kelas belum bisa dimuat saat ini.");
        } else {
          setAssignments(taskItems);
        }
      })
      .catch(()=>setErr("Kelas tidak ditemukan."));
    return ()=>{ cancelled=true; };
  },[id]);
  useEffect(()=>{ if (activeId && typeof window!=="undefined") window.localStorage.setItem(`${RESUME_KEY}${id}`, activeId); },[id,activeId]);
  async function complete(lid:string){ setBusy(lid);
    try {
      await markProgress("skill_lesson", lid);
      setDone(d=>({...d,[lid]:true}));
      if (activeLesson?.id===lid && nextLesson) {
        setActiveId(nextLesson.id);
        show("Progres tersimpan, lanjut ke materi berikutnya","success");
      } else {
        show("Progres tersimpan","success");
      }
    }
    catch { show("Gagal menyimpan progres","error"); } finally { setBusy(null); } }
  const lessons = c?.lessons ?? [];
  const lessonTitleMap = useMemo(()=>Object.fromEntries(lessons.map((lesson)=>[lesson.id, lesson.title])),[lessons]);
  const relatedAssignments = useMemo(()=>{
    const lessonIds = new Set(lessons.map((lesson)=>lesson.id));
    return (assignments ?? []).filter((assignment)=>assignment.lesson_id && lessonIds.has(assignment.lesson_id));
  },[assignments,lessons]);
  const assignmentCounts = useMemo(()=>({
    total: relatedAssignments.length,
    pending: relatedAssignments.filter((assignment)=>tabOf(assignment)==="pending").length,
    submitted: relatedAssignments.filter((assignment)=>tabOf(assignment)==="submitted").length,
    graded: relatedAssignments.filter((assignment)=>tabOf(assignment)==="graded").length,
  }),[relatedAssignments]);
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
    <div className="mt-6 flex flex-wrap gap-2">
      <button onClick={()=>setActiveTab("materi")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab==="materi"?"bg-navy-900 text-white":"border border-navy-100 bg-white text-navy-700 hover:bg-navy-50"}`}>
        Materi
      </button>
      <button onClick={()=>setActiveTab("tugas")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab==="tugas"?"bg-navy-900 text-white":"border border-navy-100 bg-white text-navy-700 hover:bg-navy-50"}`}>
        Tugas {assignments && <span className="ml-2 text-xs opacity-80">{assignmentCounts.total}</span>}
      </button>
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        {activeTab==="materi" && activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            lessonNumber={c.lessons.findIndex((lesson)=>lesson.id===activeLesson.id)+1}
            totalLessons={c.lessons.length}
            completedLessons={completedCount}
            completed={Boolean(done[activeLesson.id])}
            busy={busy===activeLesson.id}
            onComplete={()=>complete(activeLesson.id)}
            completeLabel={nextLesson ? "Selesai & lanjut" : "Tandai selesai"}
            onPrev={prevLesson ? ()=>setActiveId(prevLesson.id) : undefined}
            onNext={nextLesson ? ()=>setActiveId(nextLesson.id) : undefined}
            hasPrev={Boolean(prevLesson)}
            hasNext={Boolean(nextLesson)}
          />
        ) : activeTab==="materi" ? (
          <div className="rounded-[28px] border border-dashed border-navy-200 bg-white p-6 text-sm text-navy-600">
            Materi untuk kelas ini belum tersedia.
          </div>
        ) : (
          <section className="rounded-[28px] border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="rounded-[24px] border border-gold-100 bg-gradient-to-r from-gold-50 via-white to-navy-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Tugas kelas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="navy">Total {assignmentCounts.total}</Badge>
                <Badge tone="gold">Belum dikumpulkan {assignmentCounts.pending}</Badge>
                <Badge tone="gray">Dikumpulkan {assignmentCounts.submitted}</Badge>
                <Badge tone="green">Dinilai {assignmentCounts.graded}</Badge>
              </div>
            </div>
            {assignmentError && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{assignmentError}</p>}
            {!assignments && !assignmentError && <div className="mt-5"><Spinner /></div>}
            {assignments && relatedAssignments.length===0 && (
              <div className="mt-5 rounded-[24px] border border-dashed border-navy-200 bg-navy-50/50 p-6 text-sm text-navy-600">
                Belum ada tugas yang terkait langsung dengan materi di kelas ini.
              </div>
            )}
            <div className="mt-5 space-y-4">
              {relatedAssignments.map((assignment)=>{
                const status = tabOf(assignment);
                const overdue = isOverdue(assignment);
                const relatedLessonTitle = assignment.lesson_id ? lessonTitleMap[assignment.lesson_id] : null;
                return (
                  <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="block rounded-[24px] border border-navy-100 bg-white p-5 transition hover:border-gold-300 hover:bg-gold-50/30">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-navy-900">{assignment.title}</h3>
                        {assignment.description && <p className="mt-2 text-sm text-navy-600">{assignment.description}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {relatedLessonTitle && <Badge tone="navy">Materi: {relatedLessonTitle}</Badge>}
                          <Badge tone="gray">Tenggat: {fmt(assignment.due_date)}</Badge>
                          <Badge tone="gray">Nilai maks {assignment.max_score}</Badge>
                          {overdue && <Badge tone="red">Terlambat</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {status==="pending" && <Badge tone={overdue?"red":"gold"}>{overdue?"Segera kerjakan":"Siap dikerjakan"}</Badge>}
                        {status==="submitted" && <Badge tone="gray">Menunggu nilai</Badge>}
                        {status==="graded" && <Badge tone="green">Sudah dinilai</Badge>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <aside className="rounded-[28px] border border-navy-100 bg-white p-4 shadow-soft">
        <div className="px-2 pb-3">
          <h2 className="text-lg font-semibold text-navy-900">{activeTab==="materi"?"Daftar materi":"Ringkasan kelas"}</h2>
          <p className="mt-1 text-sm text-navy-600">
            {activeTab==="materi" ? `${c.lessons.length} materi tersedia · ${completedCount} selesai` : `${assignmentCounts.total} tugas terkait · ${assignmentCounts.pending} belum dikumpulkan`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-navy-700" style={{width:`${activeTab==="materi"?percent:(assignmentCounts.total ? Math.round(((assignmentCounts.submitted + assignmentCounts.graded)/assignmentCounts.total)*100) : 0)}%`}} />
          </div>
          <p className="mt-2 text-xs font-medium text-navy-500">
            {activeTab==="materi"
              ? `${percent}% progres kelas`
              : `${assignmentCounts.total ? Math.round(((assignmentCounts.submitted + assignmentCounts.graded)/assignmentCounts.total)*100) : 0}% tugas sudah disentuh`}
          </p>
          {activeTab==="materi" && resumed && <p className="mt-2 text-xs font-semibold text-gold-700">Melanjutkan dari materi terakhir yang dibuka.</p>}
          {activeTab==="tugas" && <p className="mt-2 text-xs font-semibold text-gold-700">Buka tugas yang terkait langsung dengan lesson di kelas ini.</p>}
        </div>
        {activeTab==="materi" ? (
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
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
              <p className="text-sm font-semibold text-navy-900">Distribusi tugas</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white p-3"><p className="text-navy-500">Belum dikumpulkan</p><p className="mt-1 text-xl font-bold text-navy-900">{assignmentCounts.pending}</p></div>
                <div className="rounded-2xl bg-white p-3"><p className="text-navy-500">Menunggu nilai</p><p className="mt-1 text-xl font-bold text-navy-900">{assignmentCounts.submitted}</p></div>
                <div className="rounded-2xl bg-white p-3"><p className="text-navy-500">Sudah dinilai</p><p className="mt-1 text-xl font-bold text-navy-900">{assignmentCounts.graded}</p></div>
                <div className="rounded-2xl bg-white p-3"><p className="text-navy-500">Total tugas</p><p className="mt-1 text-xl font-bold text-navy-900">{assignmentCounts.total}</p></div>
              </div>
            </div>
            <Link href="/student/assignments" className="block rounded-2xl border border-gold-200 bg-gold-50/60 p-4 text-sm font-semibold text-gold-800 transition hover:bg-gold-100/70">
              Lihat semua tugas siswa →
            </Link>
          </div>
        )}
      </aside>
    </div></div>);
}
