"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { buildClassJourney, type ClassJourney } from "@/lib/class-progress";
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
function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0,0,0,0);
  return next;
}
function countRecentActiveDays(activityDates: Date[]) {
  const uniqueDays = new Set(activityDates.map((date)=>startOfDay(date).getTime()));
  const today = startOfDay(new Date());
  let streak = 0;
  for (let offset = 0; offset < 14; offset += 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - offset);
    if (uniqueDays.has(current.getTime())) {
      streak += 1;
      continue;
    }
    if (offset===0) continue;
    break;
  }
  return streak;
}
function minutesLabel(total: number) {
  if (total <= 0) return "Belum ada durasi tercatat";
  if (total < 60) return `${total} menit ritme belajar`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours}j ${minutes}m ritme belajar` : `${hours} jam ritme belajar`;
}
export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary,setSummary]=useState<DashboardSummary|null>(null);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [portfolios,setPortfolios]=useState<Portfolio[]>([]);
  const [classes,setClasses]=useState<SkillClass[]>([]);
  const [classFocus,setClassFocus]=useState<Array<{ detail: SkillClassDetail; journey: ClassJourney }>>([]);
  const [progressItems,setProgressItems]=useState<ProgressItem[]>([]);
  useEffect(()=>{
    let cancelled=false;
    getDashboard().then(setSummary).catch(()=>{});
    getAssignments().then(setAssignments).catch(()=>{});
    getMyPortfolios().then(setPortfolios).catch(()=>{});
    Promise.all([getSoftSkills().catch(()=>[]), getMyProgress().catch(()=>[]), getAssignments().catch(()=>[])])
      .then(async ([skillClasses, progress, assignmentItems])=>{
        if (cancelled) return;
        setClasses(skillClasses);
        setProgressItems(progress);
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
            const journey = buildClassJourney(detail, progress, assignmentItems);
            return { detail, journey };
          })
          .sort((a,b)=>{
            if (a.journey.combinedPercent===b.journey.combinedPercent) return b.journey.pendingAssignments-a.journey.pendingAssignments;
            return a.journey.combinedPercent-b.journey.combinedPercent;
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
  const primaryFocus = classFocus[0] ?? null;
  const dashboardFocusText = useMemo(()=>{
    if (!classFocus.length) return "Mulai dari kelas yang paling dekat dengan progresmu saat ini.";
    const active = classFocus[0];
    return `${active.detail.title}: ${active.journey.nextStep}`;
  },[classFocus]);
  const weeklyStats = useMemo(()=>{
    const now = new Date();
    const weekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const completedThisWeek = progressItems.filter((item)=>item.status==="completed" && item.completed_at && new Date(item.completed_at) >= weekStart).length;
    const submittedThisWeek = assignments.filter((assignment)=>assignment.my_submission?.submitted_at && new Date(assignment.my_submission.submitted_at) >= weekStart).length;
    const activityDates = [
      ...progressItems.filter((item)=>item.completed_at).map((item)=>new Date(item.completed_at!)),
      ...assignments.filter((assignment)=>assignment.my_submission?.submitted_at).map((assignment)=>new Date(assignment.my_submission!.submitted_at!)),
    ];
    return {
      completedThisWeek,
      submittedThisWeek,
      streakDays: countRecentActiveDays(activityDates),
    };
  },[assignments,progressItems]);
  const weeklyMinutes = useMemo(()=>{
    if (!classFocus.length) return 0;
    return classFocus.reduce((totalMinutes, item)=>{
      const completedLessonIds = new Set(
        progressItems
          .filter((progress)=>progress.content_kind==="skill_lesson" && progress.status==="completed")
          .map((progress)=>progress.content_id),
      );
      return totalMinutes + item.detail.lessons
        .filter((lesson)=>completedLessonIds.has(lesson.id))
        .reduce((sum, lesson)=>sum + (lesson.duration_minutes ?? 0), 0);
    },0);
  },[classFocus,progressItems]);
  const todayAgenda = useMemo(()=>{
    const agenda: Array<{ title:string; description:string; tone:"gold"|"navy"|"green"; href:string; cta:string }> = [];
    if (primaryFocus) {
      const resumeLesson = primaryFocus.detail.lessons.find((lesson)=>!progressItems.some((progress)=>progress.content_id===lesson.id && progress.status==="completed")) ?? primaryFocus.detail.lessons[0];
      agenda.push({
        title: "Lanjutkan kelas aktif",
        description: resumeLesson ? `${primaryFocus.detail.title} · ${resumeLesson.title}` : primaryFocus.journey.nextStep,
        tone: "gold",
        href: `/kelas/${primaryFocus.detail.id}`,
        cta: "Resume kelas",
      });
    }
    if (upcoming[0]) {
      const due = daysLeft(upcoming[0].due_date!);
      agenda.push({
        title: "Amankan tenggat terdekat",
        description: `${upcoming[0].title} · ${due.text.toLowerCase()}`,
        tone: due.tone==="red" ? "gold" : "navy",
        href: `/student/assignments/${upcoming[0].id}`,
        cta: "Buka tugas",
      });
    }
    agenda.push(
      portfolios.length
        ? {
            title: "Rawat portofolio",
            description: `${portfolios.length} karya sudah tersimpan. Rapikan karya terbaik untuk tampil lebih meyakinkan.`,
            tone: "green",
            href: "/student/portfolio",
            cta: "Kelola karya",
          }
        : {
            title: "Buat karya pertama",
            description: "Mulai isi portofolio agar progres skill terasa nyata dan bisa dipamerkan.",
            tone: "navy",
            href: "/student/portfolio",
            cta: "Tambah karya",
          },
    );
    return agenda.slice(0,3);
  },[portfolios,primaryFocus,progressItems,upcoming]);
  return (<div>
    <div className="flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-navy-900">Halo, {user?.full_name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-navy-600">Ini ringkasan belajarmu di Dayanusa.</p></div>
      <Link href="/student/chat" className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 sm:inline-block">💬 Tanya Guru AI</Link>
    </div>
    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <section className="rounded-[28px] border border-navy-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Agenda belajar hari ini</p>
            <h2 className="mt-2 text-xl font-semibold text-navy-900">Tiga langkah yang paling masuk akal untuk kamu lanjutkan</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">Dashboard sekarang memandu ritme harianmu, bukan hanya menampilkan angka progres.</p>
          </div>
          <Badge tone="navy">{todayAgenda.length} agenda aktif</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {todayAgenda.map((item)=>(
            <Link key={item.title} href={item.href} className="rounded-[24px] border border-navy-100 bg-navy-50/45 p-4 transition hover:border-gold-300 hover:bg-gold-50/30">
              <Badge tone={item.tone}>{item.title}</Badge>
              <p className="mt-3 text-sm leading-6 text-navy-700">{item.description}</p>
              <p className="mt-4 text-sm font-semibold text-gold-700">{item.cta} →</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-navy-100 bg-gradient-to-br from-navy-900 via-navy-900 to-[#14345d] p-6 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Streak & ritme</p>
        <h2 className="mt-2 text-xl font-semibold">Progres mingguanmu mulai terasa seperti kebiasaan belajar</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Streak aktif</p>
            <p className="mt-2 text-3xl font-bold">{weeklyStats.streakDays} hari</p>
            <p className="mt-2 text-sm text-white/75">Aktivitas dihitung dari lesson yang selesai dan tugas yang dikirim.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Ritme belajar</p>
            <p className="mt-2 text-3xl font-bold">{minutesLabel(weeklyMinutes)}</p>
            <p className="mt-2 text-sm text-white/75">Total durasi lesson yang sudah kamu tuntaskan.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Lesson pekan ini</p>
            <p className="mt-2 text-3xl font-bold">{weeklyStats.completedThisWeek}</p>
            <p className="mt-2 text-sm text-white/75">Materi yang berhasil ditutup dalam 7 hari terakhir.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Tugas pekan ini</p>
            <p className="mt-2 text-3xl font-bold">{weeklyStats.submittedThisWeek}</p>
            <p className="mt-2 text-sm text-white/75">Submission yang berhasil kamu kirim dalam pekan ini.</p>
          </div>
        </div>
      </section>
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
              <div className="flex flex-wrap justify-end gap-2">
                <Badge tone={item.journey.stageTone}>{item.journey.stageLabel}</Badge>
                <Badge tone="navy">{item.journey.combinedPercent}% total</Badge>
              </div>
            </div>
            <div className="mt-4"><ProgressBar percent={item.journey.combinedPercent} /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.journey.completedLessons}/{item.journey.totalLessons}</p>
                <p className="mt-1 text-navy-600">Materi</p>
              </div>
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.journey.pendingAssignments}</p>
                <p className="mt-1 text-navy-600">Tugas</p>
              </div>
              <div className="rounded-2xl bg-white px-2 py-3">
                <p className="font-semibold text-navy-900">{item.journey.stageLabel}</p>
                <p className="mt-1 text-navy-600">Status</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-gold-100 bg-gold-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Langkah berikutnya</p>
              <p className="mt-1 text-sm text-navy-700">{item.journey.nextStep}</p>
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
    </div>
    {primaryFocus && (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
        <div className="pointer-events-auto mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-navy-100 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(7,23,49,0.14)] backdrop-blur">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-700">Quick resume</p>
            <p className="truncate text-sm font-semibold text-navy-900">{primaryFocus.detail.title}</p>
            <p className="truncate text-xs text-navy-600">{primaryFocus.journey.nextStep}</p>
          </div>
          <Link href={`/kelas/${primaryFocus.detail.id}`} className="shrink-0 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800">
            Lanjut belajar
          </Link>
        </div>
      </div>
    )}
  </div>);
}
function Stat({ label, value, tone="navy" }:{label:string; value?:number; tone?:"navy"|"green"|"gold"}) {
  const color = tone==="green"?"text-emerald-700":tone==="gold"?"text-gold-700":"text-navy-900";
  return (<div className="rounded-xl2 border border-navy-100 bg-white p-5"><p className={`text-3xl font-extrabold ${color}`}>{value ?? "—"}</p><p className="mt-1 text-sm text-navy-600">{label}</p></div>);
}
