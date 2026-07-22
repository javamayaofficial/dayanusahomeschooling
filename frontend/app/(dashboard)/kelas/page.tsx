"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAssignments } from "@/lib/assignments";
import { buildClassJourney, type ClassJourney } from "@/lib/class-progress";
import { getMyProgress, getSoftSkill, getSoftSkills } from "@/lib/learning";
import ProgressBar from "@/components/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Assignment, ProgressItem, SkillClass, SkillClassDetail } from "@/types";
const CAT:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator"};
const LVL:Record<string,string>={beginner:"Pemula",intermediate:"Menengah",advanced:"Lanjutan"};
export default function KelasListPage() {
  const [cs,setCs]=useState<SkillClass[]|null>(null); const [err,setErr]=useState<string|null>(null);
  const [journeyByClass,setJourneyByClass]=useState<Record<string, ClassJourney>>({});
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
        const nextJourney = details.reduce<Record<string, ClassJourney>>((acc, detail)=>{
          if (!detail) return acc;
          acc[detail.id] = buildClassJourney(detail, progress, assignments);
          return acc;
        },{});
        setJourneyByClass(nextJourney);
      })
      .catch(()=>setErr("Gagal memuat kelas."));
    return ()=>{ cancelled=true; };
  },[]);
  const featured = useMemo(()=>cs?.map((skillClass)=>({ skillClass, journey: journeyByClass[skillClass.id] })).sort((a,b)=>(a.journey?.combinedPercent ?? 0)-(b.journey?.combinedPercent ?? 0)) ?? [],[cs,journeyByClass]);
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
              {journey && <Badge tone={journey.stageTone}>{journey.stageLabel}</Badge>}
              {journey && <Badge tone="navy">{journey.combinedPercent}% total</Badge>}
            </div>
            <div className="mt-4">
              <ProgressBar percent={journey?.combinedPercent ?? 0} />
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
                <p className="font-semibold text-navy-900">{journey?.stageLabel ?? "Belajar"}</p>
                <p className="mt-1 text-navy-600">Status</p>
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
