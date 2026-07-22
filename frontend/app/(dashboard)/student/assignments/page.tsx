"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAssignments, tabOf, isOverdue, type Tab } from "@/lib/assignments";
import ProgressBar from "@/components/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Assignment } from "@/types";
const TABS:{key:Tab;label:string}[]=[{key:"pending",label:"Belum dikumpulkan"},{key:"submitted",label:"Sudah dikumpulkan"},{key:"graded",label:"Sudah dinilai"}];
function fmt(iso?:string|null){ return iso ? new Date(iso).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "Tanpa tenggat"; }
function daysUntil(iso?:string|null){
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now())/86400000);
}
function urgencyMeta(assignment: Assignment){
  const days = daysUntil(assignment.due_date);
  if (tabOf(assignment)==="graded") return { label:"Sudah dinilai", tone:"green" as const, detail:"Feedback tutor sudah tersedia." };
  if (tabOf(assignment)==="submitted") return { label:"Menunggu nilai", tone:"gray" as const, detail:"Submission sudah masuk, tinggal tunggu review tutor." };
  if (days === null) return { label:"Tanpa tenggat", tone:"navy" as const, detail:"Bisa dikerjakan sesuai ritme belajarmu." };
  if (days < 0) return { label:"Terlambat", tone:"red" as const, detail:"Prioritaskan tugas ini lebih dulu." };
  if (days === 0) return { label:"Deadline hari ini", tone:"red" as const, detail:"Usahakan submit sebelum hari berakhir." };
  if (days <= 3) return { label:`${days} hari lagi`, tone:"gold" as const, detail:"Masuk prioritas tinggi minggu ini." };
  return { label:`${days} hari lagi`, tone:"navy" as const, detail:"Masih punya ruang untuk disiapkan." };
}
export default function AssignmentsPage() {
  const [items,setItems]=useState<Assignment[]|null>(null); const [error,setError]=useState<string|null>(null); const [tab,setTab]=useState<Tab>("pending");
  useEffect(()=>{ getAssignments().then(setItems).catch(()=>setError("Gagal memuat tugas.")); },[]);
  const grouped=useMemo(()=>{ const g:Record<Tab,Assignment[]>={pending:[],submitted:[],graded:[]}; (items??[]).forEach(a=>g[tabOf(a)].push(a)); return g; },[items]);
  const visible=useMemo(()=>{
    return [...grouped[tab]].sort((a,b)=>{
      const left = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return left-right;
    });
  },[grouped,tab]);
  const total = items?.length ?? 0;
  const completionPercent = total ? Math.round(((grouped.submitted.length + grouped.graded.length)/total)*100) : 0;
  const spotlight = useMemo(()=>{
    return (items ?? [])
      .filter((assignment)=>tabOf(assignment)==="pending")
      .sort((a,b)=>{
        const left = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const right = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        return left-right;
      })
      .slice(0,3);
  },[items]);
  const boardMessage = grouped.pending.length
    ? `Ada ${grouped.pending.length} tugas yang masih perlu disiapkan. Mulai dari tenggat yang paling dekat agar ritme belajarmu tetap aman.`
    : grouped.submitted.length
      ? `Semua tugas aktif sudah dikirim. Sekarang fokusmu bergeser ke menunggu feedback tutor.`
      : grouped.graded.length
        ? `Tugas-tugas utama sudah mendapatkan penilaian. Gunakan feedback untuk memperkuat portofolio.`
        : "Belum ada tugas yang perlu dikerjakan saat ini.";
  return (<div>
    <h1 className="text-2xl font-bold text-navy-900">Tugas</h1>
    <p className="mt-1 text-navy-600">Kerjakan tugas praktik dan lihat penilaian dari tutor.</p>
    <section className="mt-6 rounded-[28px] border border-navy-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Command center tugas</p>
          <h2 className="mt-2 text-xl font-semibold text-navy-900">Semua tugas, tenggat, dan status review terlihat dalam satu papan</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">{boardMessage}</p>
        </div>
        <div className="rounded-[22px] border border-gold-100 bg-gold-50/70 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Progres submission</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{completionPercent}%</p>
          <p className="text-xs text-navy-600">{grouped.submitted.length + grouped.graded.length} dari {total} tugas tersentuh</p>
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar percent={completionPercent} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-[24px] border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">Total</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{total}</p>
          <p className="mt-2 text-sm text-navy-600">Semua tugas yang aktif untuk akunmu.</p>
        </div>
        <div className="rounded-[24px] border border-gold-100 bg-gold-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Prioritas</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{grouped.pending.length}</p>
          <p className="mt-2 text-sm text-navy-600">Tugas yang masih menunggu dikerjakan.</p>
        </div>
        <div className="rounded-[24px] border border-navy-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">Menunggu review</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{grouped.submitted.length}</p>
          <p className="mt-2 text-sm text-navy-600">Submission yang sudah masuk ke tutor.</p>
        </div>
        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Sudah dinilai</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{grouped.graded.length}</p>
          <p className="mt-2 text-sm text-navy-600">Tugas dengan nilai atau feedback akhir.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {spotlight.length===0 ? (
          <div className="rounded-[24px] border border-dashed border-navy-200 bg-navy-50/50 p-5 text-sm text-navy-600 lg:col-span-3">
            Tidak ada tugas prioritas tinggi saat ini. Kamu bisa menunggu feedback tutor atau lanjut memperkuat portofolio.
          </div>
        ) : spotlight.map((assignment)=>{ const meta=urgencyMeta(assignment); return (
          <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="rounded-[24px] border border-navy-100 bg-navy-50/45 p-4 transition hover:border-gold-300 hover:bg-gold-50/30">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Fokus berikutnya</p>
                <h3 className="mt-2 line-clamp-2 font-semibold text-navy-900">{assignment.title}</h3>
              </div>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-navy-600">{meta.detail}</p>
            <p className="mt-3 text-xs text-navy-500">Tenggat {fmt(assignment.due_date)} · Nilai maks {assignment.max_score}</p>
          </Link>
        ); })}
      </div>
    </section>
    <div className="mt-6 flex flex-wrap gap-2">
      {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab===t.key?"bg-navy-900 text-white":"border border-navy-100 bg-white text-navy-600 hover:bg-navy-50"}`}>
        {t.label}{items && <span className="ml-2 text-xs opacity-80">{grouped[t.key].length}</span>}</button>))}
    </div>
    {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {!items && !error && <Spinner />}
    {items && visible.length===0 && <p className="mt-6 rounded-xl2 border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-navy-600">Tidak ada tugas di kategori ini.</p>}
    <div className="mt-6 space-y-3">
      {visible.map(a=>{ const overdue=isOverdue(a); const meta=urgencyMeta(a); return (
        <Link key={a.id} href={`/student/assignments/${a.id}`} className="block rounded-[26px] border border-navy-100 bg-white p-5 transition-colors hover:border-gold">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              <span className="text-xs text-navy-500">Tenggat {fmt(a.due_date)}</span>
            </div>
              <h3 className="mt-3 font-semibold text-navy-900">{a.title}</h3>
              {a.description && <p className="mt-1 line-clamp-1 text-sm text-navy-600">{a.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-navy-600">Nilai maks {a.max_score}</span>
                {overdue && <Badge tone="red">Terlambat</Badge>}<span className="text-xs text-navy-600">· {meta.detail}</span></div></div>
            {tab==="graded" && a.my_submission?.grade!=null ? (<div className="text-right"><p className="text-2xl font-extrabold text-navy-900">{a.my_submission.grade}</p><p className="text-xs text-navy-600">/ {a.max_score}</p></div>)
            : (<div className="shrink-0 text-right"><p className="text-sm font-semibold text-navy-900">{tab==="pending"?"Kerjakan sekarang":tab==="submitted"?"Pantau review":"Buka detail"}</p><p className="mt-1 text-xs text-gold-700">Lihat detail →</p></div>)}
          </div></Link>); })}
    </div></div>);
}
