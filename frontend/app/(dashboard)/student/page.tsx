"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getDashboard } from "@/lib/learning";
import { getAssignments, tabOf } from "@/lib/assignments";
import { getMyPortfolios } from "@/lib/portfolio";
import ProgressBar from "@/components/ProgressBar";
import Badge from "@/components/ui/Badge";
import MediaPreview from "@/components/MediaPreview";
import type { Assignment, DashboardSummary, Portfolio } from "@/types";
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
  useEffect(()=>{ getDashboard().then(setSummary).catch(()=>{}); getAssignments().then(setAssignments).catch(()=>{}); getMyPortfolios().then(setPortfolios).catch(()=>{}); },[]);
  const total=assignments.length; const done=assignments.filter(a=>tabOf(a)!=="pending").length; const pending=total-done;
  const upcoming=assignments.filter(a=>tabOf(a)==="pending"&&a.due_date).sort((a,b)=>new Date(a.due_date!).getTime()-new Date(b.due_date!).getTime()).slice(0,3);
  const latestWorks=portfolios.slice(0,3);
  return (<div>
    <div className="flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-navy-900">Halo, {user?.full_name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-navy-600">Ini ringkasan belajarmu di Dayanusa.</p></div>
      <Link href="/student/chat" className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 sm:inline-block">💬 Tanya Guru AI</Link>
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
