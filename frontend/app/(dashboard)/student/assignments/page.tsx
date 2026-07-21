"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAssignments, tabOf, isOverdue, type Tab } from "@/lib/assignments";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Assignment } from "@/types";
const TABS:{key:Tab;label:string}[]=[{key:"pending",label:"Belum dikumpulkan"},{key:"submitted",label:"Sudah dikumpulkan"},{key:"graded",label:"Sudah dinilai"}];
function fmt(iso?:string|null){ return iso ? new Date(iso).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "Tanpa tenggat"; }
export default function AssignmentsPage() {
  const [items,setItems]=useState<Assignment[]|null>(null); const [error,setError]=useState<string|null>(null); const [tab,setTab]=useState<Tab>("pending");
  useEffect(()=>{ getAssignments().then(setItems).catch(()=>setError("Gagal memuat tugas.")); },[]);
  const grouped=useMemo(()=>{ const g:Record<Tab,Assignment[]>={pending:[],submitted:[],graded:[]}; (items??[]).forEach(a=>g[tabOf(a)].push(a)); return g; },[items]);
  const visible=grouped[tab];
  return (<div>
    <h1 className="text-2xl font-bold text-navy-900">Tugas</h1>
    <p className="mt-1 text-navy-600">Kerjakan tugas praktik dan lihat penilaian dari tutor.</p>
    <div className="mt-6 flex flex-wrap gap-2">
      {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab===t.key?"bg-navy-900 text-white":"border border-navy-100 bg-white text-navy-600 hover:bg-navy-50"}`}>
        {t.label}{items && <span className="ml-2 text-xs opacity-80">{grouped[t.key].length}</span>}</button>))}
    </div>
    {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {!items && !error && <Spinner />}
    {items && visible.length===0 && <p className="mt-6 rounded-xl2 border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-navy-600">Tidak ada tugas di kategori ini.</p>}
    <div className="mt-6 space-y-3">
      {visible.map(a=>{ const overdue=isOverdue(a); return (
        <Link key={a.id} href={`/student/assignments/${a.id}`} className="block rounded-xl2 border border-navy-100 bg-white p-5 transition-colors hover:border-gold">
          <div className="flex items-start justify-between gap-4">
            <div><h3 className="font-semibold text-navy-900">{a.title}</h3>
              {a.description && <p className="mt-1 line-clamp-1 text-sm text-navy-600">{a.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-navy-600">Tenggat: {fmt(a.due_date)}</span>
                {overdue && <Badge tone="red">Terlambat</Badge>}<span className="text-xs text-navy-600">· Nilai maks {a.max_score}</span></div></div>
            {tab==="graded" && a.my_submission?.grade!=null ? (<div className="text-right"><p className="text-2xl font-extrabold text-navy-900">{a.my_submission.grade}</p><p className="text-xs text-navy-600">/ {a.max_score}</p></div>)
            : (<Badge tone={tab==="submitted"?"gold":"navy"}>{tab==="pending"?"Kerjakan":tab==="submitted"?"Menunggu nilai":""}</Badge>)}
          </div></Link>); })}
    </div></div>);
}
