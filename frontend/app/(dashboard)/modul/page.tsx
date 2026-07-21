"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getModules } from "@/lib/learning";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Module } from "@/types";
const PK:Record<string,string>={paket_a:"Paket A",paket_b:"Paket B",paket_c:"Paket C"};
export default function ModulListPage() {
  const [mods,setMods]=useState<Module[]|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{ getModules().then(setMods).catch(()=>setErr("Gagal memuat modul.")); },[]);
  return (<div>
    <h1 className="text-2xl font-bold text-navy-900">Modul PKBM</h1>
    <p className="mt-1 text-navy-600">Materi pendidikan formal jalur ijazah kesetaraan.</p>
    {err && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
    {!mods && !err && <Spinner />}
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {mods?.map(m=>(<Link key={m.id} href={`/modul/${m.id}`} className="rounded-xl2 border border-navy-100 bg-white p-6 transition-colors hover:border-gold">
        <div className="flex items-center gap-2"><Badge>{PK[m.paket]}</Badge><span className="text-xs text-navy-600">{m.subject}</span></div>
        <h3 className="mt-3 font-semibold text-navy-900">{m.title}</h3>
        {m.description && <p className="mt-2 line-clamp-2 text-sm text-navy-600">{m.description}</p>}</Link>))}
    </div>
    {mods?.length===0 && <p className="mt-6 text-sm text-navy-600">Belum ada modul.</p>}</div>);
}
