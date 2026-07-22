"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAssignments } from "@/lib/assignments";
import { getMyProgress, getSoftSkill, getSoftSkills } from "@/lib/learning";
import ProgressBar from "@/components/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Assignment, ProgressItem, SkillClass, SkillClassDetail } from "@/types";
const CAT:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator"};
const LVL:Record<string,string>={beginner:"Pemula",intermediate:"Menengah",advanced:"Lanjutan"};
type Journey = {
  totalLessons:number;
  completedLessons:number;
  percent:number;
  totalAssignments:number;
  pendingAssignments:number;
  gradedAssignments:number;
  nextStep:string;
  tone:"green"|"gold"|"navy";
};
function buildJourney(skillClass: SkillClassDetail, progress: ProgressItem[], assignments: Assignment[]): Journey {
  const lessonIds = new Set(skillClass.lessons.map((lesson)=>lesson.id));
  const completedLessonIds = new Set(
    progress
      .filter((item)=>item.content_kind==="skill_lesson" && item.status==="completed" && lessonIds.has(item.content_id))
      .map((item)=>item.content_id),
  );
  const relatedAssignments = assignments.filter((assignment)=>assignment.lesson_id && lessonIds.has(assignment.lesson_id));
  const pendingAssignments = relatedAssignments.filter((assignment)=>!assignment.my_submission).length;
  const gradedAssignments = relatedAssignments.filter((assignment)=>assignment.my_submission?.status==="graded").length;
  const totalLessons = skillClass.lessons.length;
  const completedLessons = completedLessonIds.size;
  const percent = totalLessons ? Math.round((completedLessons/totalLessons)*100) : 0;
  if (!totalLessons) return { totalLessons, completedLessons, percent, totalAssignments: relatedAssignments.length, pendingAssignments, gradedAssignments, nextStep:"Materi segera hadir di kelas ini.", tone:"navy" };
  if (completedLessons < totalLessons) {
    return {
      totalLessons,
      completedLessons,
      percent,
      totalAssignments: relatedAssignments.length,
      pendingAssignments,
      gradedAssignments,
      nextStep:`Lanjutkan ${skillClass.lessons[completedLessons]?.title ?? "materi berikutnya"}.`,
      tone:"gold",
    };
  }
  if (relatedAssignments.length > 0 && pendingAssignments > 0) {
    return {
      totalLessons,
      completedLessons,
      percent,
      totalAssignments: relatedAssignments.length,
      pendingAssignments,
      gradedAssignments,
      nextStep:`Semua materi selesai. Kerjakan ${pendingAssignments} tugas yang tersisa.`,
      tone:"navy",
    };
  }
  if (gradedAssignments > 0) {
    return {
      totalLessons,
      completedLessons,
      percent,
      totalAssignments: relatedAssignments.length,
      pendingAssignments,
      gradedAssignments,
      nextStep:"Sebagian tugas sudah dinilai. Lihat hasil dan feedback tutor.",
      tone:"green",
    };
  }
  return {
    totalLessons,
    completedLessons,
    percent,
    totalAssignments: relatedAssignments.length,
    pendingAssignments,
    gradedAssignments,
    nextStep: relatedAssignments.length ? "Materi selesai. Pantau status tugas di kelas ini." : "Materi kelas sudah selesai dipelajari.",
    tone:"green",
  };
}
export default function KelasListPage() {
  const [cs,setCs]=useState<SkillClass[]|null>(null); const [err,setErr]=useState<string|null>(null);
  const [journeyByClass,setJourneyByClass]=useState<Record<string, Journey>>({});
  useEffect(()=>{
    let cancelled=false;
    Promise.all([getSoftSkills(), getMyProgress().catch(()=>[]), getAssignments().catch(()=>[])])
      .then(async ([classes, progress, assignments])=>{
        if (cancelled) return;
        setCs(classes);
        const details = await Promise.all(classes.map(async (skillClass)=>{
          try {
            return await getSoftSkill(skillClass.id);
          } catch {
            return null;
          }
        }));
        if (cancelled) return;
        const nextJourney = details.reduce<Record<string, Journey>>((acc, detail)=>{
          if (!detail) return acc;
          acc[detail.id] = buildJourney(detail, progress, assignments);
          return acc;
        },{});
        setJourneyByClass(nextJourney);
      })
      .catch(()=>setErr("Gagal memuat kelas."));
    return ()=>{ cancelled=true; };
  },[]);
  const featured = useMemo(()=>cs?.map((skillClass)=>({ skillClass, journey: journeyByClass[skillClass.id] })).sort((a,b)=>(a.journey?.percent ?? 0)-(b.journey?.percent ?? 0)) ?? [],[cs,journeyByClass]);
  return (<div>
    <h1 className="text-2xl font-bold text-navy-900">Kelas Soft Skill</h1>
    <p className="mt-1 text-navy-600">Vokasi berbasis SKKNI — jalur sertifikasi BNSP.</p>
    <div className="mt-6 rounded-xl2 border border-navy-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Papan progres kelas</p>
          <h2 className="mt-2 text-xl font-semibold text-navy-900">Pilih kelas berdasarkan langkah belajarmu saat ini</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">Setiap kartu sekarang menunjukkan progres materi, tugas yang tersisa, dan aksi paling masuk akal untuk dilanjutkan.</p>
        </div>
        <div className="rounded-2xl border border-gold-100 bg-gold-50/70 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Kelas aktif</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{cs?.length ?? 0}</p>
          <p className="text-xs text-navy-600">tersedia untuk dipelajari</p>
        </div>
      </div>
      {featured.length>0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {featured.slice(0,3).map(({ skillClass, journey })=>(
            <div key={skillClass.id} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4">
              <p className="text-sm font-semibold text-navy-900">{skillClass.title}</p>
              <p className="mt-1 text-xs text-navy-600">{journey ? journey.nextStep : "Sedang memuat ringkasan progres kelas."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    {err && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
    {!cs && !err && <Spinner />}
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {cs?.map(c=>{
        const journey = journeyByClass[c.id];
        return (
          <Link key={c.id} href={`/kelas/${c.id}`} className="rounded-xl2 border border-navy-100 bg-white p-6 transition-colors hover:border-gold">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">{CAT[c.category]??c.category}</span>
            <h3 className="mt-2 font-semibold text-navy-900">{c.title}</h3>
            {c.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">{c.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{LVL[c.level]??c.level}</Badge>
              {c.is_bnsp_certified && <Badge tone="gold">BNSP</Badge>}
              {journey && <Badge tone={journey.tone}>{journey.percent}% materi</Badge>}
            </div>
            <div className="mt-4">
              <ProgressBar percent={journey?.percent ?? 0} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-navy-50/70 px-2 py-3">
                <p className="font-semibold text-navy-900">{journey?.completedLessons ?? 0}/{journey?.totalLessons ?? 0}</p>
                <p className="mt-1 text-navy-600">Materi</p>
              </div>
              <div className="rounded-2xl bg-navy-50/70 px-2 py-3">
                <p className="font-semibold text-navy-900">{journey?.pendingAssignments ?? 0}</p>
                <p className="mt-1 text-navy-600">Tugas tersisa</p>
              </div>
              <div className="rounded-2xl bg-navy-50/70 px-2 py-3">
                <p className="font-semibold text-navy-900">{journey?.gradedAssignments ?? 0}</p>
                <p className="mt-1 text-navy-600">Sudah dinilai</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-gold-100 bg-gold-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Langkah berikutnya</p>
              <p className="mt-1 text-sm text-navy-700">{journey?.nextStep ?? "Memuat ringkasan progres kelas..."}</p>
            </div>
          </Link>
        );
      })}
    </div></div>);
}
