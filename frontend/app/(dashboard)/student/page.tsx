"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getDashboard, getMyProgress, getSoftSkill, getSoftSkills } from "@/lib/learning";
import { getAssignments, tabOf } from "@/lib/assignments";
import { getMyPortfolios } from "@/lib/portfolio";
import ProgressBar from "@/components/ProgressBar";
import Badge from "@/components/ui/Badge";
import MediaPreview from "@/components/MediaPreview";
import type { Assignment, DashboardSummary, Portfolio, ProgressItem, SkillClass, SkillClassDetail } from "@/types";
function daysLeft(iso: string): { text: string; tone: "red"|"gold"|"navy" } {
  const d = Math.ceil((new Date(iso).getTime() - Date.now())/86400000);
  if (d < 0) return { text:"Terlambat", tone:"red" };
  if (d === 0) return { text:"Hari ini", tone:"red" };
  if (d <= 3) return { text:`${d} hari lagi`, tone:"gold" };
  return { text:`${d} hari lagi`, tone:"navy" };
}
export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary,setSummary]=useState<DashboardSummary|null>(null);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [portfolios,setPortfolios]=useState<Portfolio[]>([]);
  const [classes,setClasses]=useState<SkillClass[]>([]);
  const [classFocus,setClassFocus]=useState<Array<{ detail: SkillClassDetail; progressPercent:number; completedLessons:number; totalLessons:number; pendingAssignments:number; nextStep:string }>>([]);
  useEffect(()=>{
    let cancelled=false;
    getDashboard().then(setSummary).catch(()=>{});
    getAssignments().then(setAssignments).catch(()=>{});
    getMyPortfolios().then(setPortfolios).catch(()=>{});
    Promise.all([getSoftSkills().catch(()=>[]), getMyProgress().catch(()=>[]), getAssignments().catch(()=>[])])
      .then(async ([skillClasses, progress, assignmentItems])=>{
        if (cancelled) return;
        setClasses(skillClasses);
        const details = await Promise.all(skillClasses.map(async (skillClass)=>{
          try {
            return await getSoftSkill(skillClass.id);
          } catch {
            return null;
          }
        }));
        if (cancelled) return;
        const nextFocus = details
          .filter((detail): detail is SkillClassDetail => Boolean(detail))
          .map((detail)=>{
            const lessonIds = new Set(detail.lessons.map((lesson)=>lesson.id));
            const completedLessons = new Set(
              (progress as ProgressItem[])
                .filter((item)=>item.content_kind==="skill_lesson" && item.status==="completed" && lessonIds.has(item.content_id))
                .map((item)=>item.content_id),
            ).size;
            const relatedAssignments = (assignmentItems as Assignment[]).filter((assignment)=>assignment.lesson_id && lessonIds.has(assignment.lesson_id));
            const pendingAssignments = relatedAssignments.filter((assignment)=>!assignment.my_submission).length;
            const totalLessons = detail.lessons.length;
            const progressPercent = totalLessons ? Math.round((completedLessons/totalLessons)*100) : 0;
            const nextStep = completedLessons < totalLessons
              ? `Lanjutkan materi ke-${completedLessons + 1} di kelas ini.`
              : pendingAssignments > 0
                ? `Kerjakan ${pendingAssignments} tugas yang masih menunggu.`
                : "Pantau nilai dan feedback tutor untuk kelas ini.";
            return { detail, progressPercent, completedLessons, totalLessons, pendingAssignments, nextStep };
          })
          .sort((a,b)=>{
            if (a.progressPercent===b.progressPercent) return b.pendingAssignments-a.pendingAssignments;
            return a.progressPercent-b.progressPercent;
          })
          .slice(0,3);
        setClassFocus(nextFocus);
      })
      .catch(()=>{});
    return ()=>{ cancelled=true; };
  },[]);
  const total=assignments.length; const done=assignments.filter(a=>tabOf(a)!=="pending").length; const pending=total-done;
  const upcoming=assignments.filter(a=>tabOf(a)==="pending"&&a.due_date).sort((a,b)=>new Date(a.due_date!).getTime()-new Date(b.due_date!).getTime()).slice(0,3);
  const latestWorks=portfolios.slice(0,3);
  const dashboardFocusText = useMemo(()=>{
    if (!classFocus.length) return "Mulai dari kelas yang paling dekat dengan progresmu saat ini.";
    const active = classFocus[0];
    return `${active.detail.title}: ${active.nextStep}`;
  },[classFocus]);
  return (<div>
    <div className="flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-navy-900">Halo, {user?.full_name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-navy-600">Ini ringkasan belajarmu di Dayanusa.</p></div>
      <Link href="/student/chat" className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 sm:inline-block">💬 Tanya Guru AI</Link>
    </div>
    <div className="mt-6 rounded-xl2 border border-navy-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Fokus belajar hari ini</p>
          <h2 className="mt-2 text-xl font-semibold text-navy-900">Lanjutkan kelas yang paling dekat untuk dituntaskan</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">{dashboardFocusText}</p>
        </div>
        <div className="rounded-2xl border border-gold-100 bg-gold-50/70 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Kelas tersedia</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{classes.length}</p>
          <p className="text-xs text-navy-600">siap dilanjutkan</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {classFocus.length===0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/60 p-5 text-sm text-navy-600 lg:col-span-3">
            Ringkasan progres kelas sedang disiapkan.
          </div>
        ) : classFocus.map((item)=>(
          <Link key={item.detail.id} href={`/kelas/${item.detail.id}`} className="rounded-2xl border border-navy-100 bg-navy-50/50 p-5 transition hover:border-gold-300 hover:bg-gold-50/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Kelas aktif</p>
                <h3 className="mt-2 font-semibold text-navy-900">{item.detail.title}</h3>
              </div>
              <Badge tone={item.progressPercent===100?"green":item.pendingAssignments>0?"gold":"navy"}>{item.progressPercent}% selesai</Badge>
            </div>
            <div className="mt-4"><ProgressBar percent={item.progressPercent} /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.completedLessons}/{item.totalLessons}</p>
                <p className="mt-1 text-navy-600">Materi</p>
              </div>
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.pendingAssignments}</p>
                <p className="mt-1 text-navy-600">Tugas</p>
              </div>
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.progressPercent===100 && item.pendingAssignments===0 ? "Siap" : "Lanjut"}</p>
                <p className="mt-1 text-navy-600">Status</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-gold-100 bg-gold-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Langkah berikutnya</p>
              <p className="mt-1 text-sm text-navy-700">{item.nextStep}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl2 border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-navy-900">Akademik (PKBM)</h3>
          <span className="text-sm text-navy-600">{summary?`${summary.academic.completed}/${summary.academic.total}`:"…"}</span></div>
        <div className="mt-3"><ProgressBar percent={summary?.academic.percent ?? 0} /></div>
        <Link href="/modul" className="mt-4 inline-block text-sm font-semibold text-gold-700 hover:underline">Lihat modul →</Link></div>
      <div className="rounded-xl2 border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-navy-900">Soft Skill (Vokasi)</h3>
          <span className="text-sm text-navy-600">{summary?`${summary.soft_skill.completed}/${summary.soft_skill.total}`:"…"}</span></div>
        <div className="mt-3"><ProgressBar percent={summary?.soft_skill.percent ?? 0} /></div>
        <Link href="/kelas" className="mt-4 inline-block text-sm font-semibold text-gold-700 hover:underline">Lihat kelas →</Link></div>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-4">
      <Stat label="Total tugas" value={total} /><Stat label="Selesai" value={done} tone="green" />
      <Stat label="Belum dikumpulkan" value={pending} tone="gold" /><Stat label="Total karya" value={portfolios.length} />
    </div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl2 border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-navy-900">Tugas Mendekati Tenggat</h3>
          <Link href="/student/assignments" className="text-sm text-gold-700 hover:underline">Semua</Link></div>
        <div className="mt-4 space-y-3">
          {upcoming.length===0 && <p className="text-sm text-navy-600">Tidak ada tugas mendesak. 🎉</p>}
          {upcoming.map(a=>{ const dl=daysLeft(a.due_date!); return (
            <Link key={a.id} href={`/student/assignments/${a.id}`} className="flex items-center justify-between rounded-xl border border-navy-100 p-3 hover:bg-navy-50">
              <div><p className="font-medium text-navy-900">{a.title}</p>
                <p className="text-xs text-navy-600">{new Date(a.due_date!).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</p></div>
              <Badge tone={dl.tone}>{dl.text}</Badge></Link>); })}
        </div></div>
      <div className="rounded-xl2 border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-navy-900">Portofolio Saya</h3>
          <Link href="/student/portfolio" className="text-sm text-gold-700 hover:underline">Kelola</Link></div>
        {latestWorks.length===0 ? (<p className="mt-4 text-sm text-navy-600">Belum ada karya. <Link href="/student/portfolio" className="font-medium text-gold-700 hover:underline">Tambah karya pertamamu →</Link></p>)
        : (<div className="mt-4 grid grid-cols-3 gap-3">
            {latestWorks.map(p=>(<Link key={p.id} href="/student/portfolio" className="overflow-hidden rounded-xl border border-navy-100">
              <MediaPreview type={p.media_type} url={p.media_url} className="aspect-square" />
              <p className="truncate px-2 py-1.5 text-xs font-medium text-navy-900">{p.title}</p></Link>))}
          </div>)}
      </div>
    </div></div>);
}
function Stat({ label, value, tone="navy" }:{label:string; value?:number; tone?:"navy"|"green"|"gold"}) {
  const color = tone==="green"?"text-emerald-700":tone==="gold"?"text-gold-700":"text-navy-900";
  return (<div className="rounded-xl2 border border-navy-100 bg-white p-5"><p className={`text-3xl font-extrabold ${color}`}>{value ?? "—"}</p><p className="mt-1 text-sm text-navy-600">{label}</p></div>);
}
