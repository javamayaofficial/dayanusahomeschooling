"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getModule, markProgress } from "@/lib/learning";
import { useToast } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";
import type { ModuleDetail } from "@/types";
const T:Record<string,string>={text:"Teks",video:"Video",pdf:"PDF",link:"Tautan"};
export default function ModuleDetailPage() {
  const { id } = useParams<{id:string}>(); const { show } = useToast();
  const [m,setM]=useState<ModuleDetail|null>(null); const [err,setErr]=useState<string|null>(null);
  const [done,setDone]=useState<Record<string,boolean>>({}); const [busy,setBusy]=useState<string|null>(null);
  useEffect(()=>{ getModule(id).then(setM).catch(()=>setErr("Modul tidak ditemukan.")); },[id]);
  async function complete(lid:string){ setBusy(lid);
    try { await markProgress("module_lesson", lid); setDone(d=>({...d,[lid]:true})); show("Progres tersimpan","success"); }
    catch { show("Gagal menyimpan progres","error"); } finally { setBusy(null); } }
  if (err) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>;
  if (!m) return <Spinner />;
  return (<div>
    <Link href="/modul" className="text-sm text-navy-600 hover:underline">← Kembali ke modul</Link>
    <h1 className="mt-3 text-2xl font-bold text-navy-900">{m.title}</h1>
    <p className="mt-1 text-sm text-navy-600">{m.subject}</p>
    {m.description && <p className="mt-3 text-navy-600">{m.description}</p>}
    <h2 className="mt-8 text-lg font-semibold text-navy-900">Materi</h2>
    <ol className="mt-3 space-y-3">
      {m.lessons.map((l,i)=>(<li key={l.id} className="flex items-center justify-between rounded-xl2 border border-navy-100 bg-white p-4">
        <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-50 text-sm font-semibold text-navy-600">{i+1}</span>
          <div><p className="font-medium text-navy-900">{l.title}</p><p className="text-xs text-navy-600">{T[l.content_type]}{l.duration_minutes?` · ${l.duration_minutes} menit`:""}</p></div></div>
        <button onClick={()=>complete(l.id)} disabled={busy===l.id||done[l.id]} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${done[l.id]?"bg-emerald-50 text-emerald-700":"border border-navy-100 text-navy-900 hover:bg-navy-50"} disabled:opacity-70`}>
          {done[l.id]?"✓ Selesai":busy===l.id?"Menyimpan…":"Tandai selesai"}</button></li>))}
    </ol></div>);
}
