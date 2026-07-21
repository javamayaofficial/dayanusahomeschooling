"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSoftSkills } from "@/lib/learning";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { SkillClass } from "@/types";
const CAT:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator"};
const LVL:Record<string,string>={beginner:"Pemula",intermediate:"Menengah",advanced:"Lanjutan"};
export default function KelasListPage() {
  const [cs,setCs]=useState<SkillClass[]|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{ getSoftSkills().then(setCs).catch(()=>setErr("Gagal memuat kelas.")); },[]);
  return (<div>
    <h1 className="text-2xl font-bold text-navy-900">Kelas Soft Skill</h1>
    <p className="mt-1 text-navy-600">Vokasi berbasis SKKNI — jalur sertifikasi BNSP.</p>
    {err && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
    {!cs && !err && <Spinner />}
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {cs?.map(c=>(<Link key={c.id} href={`/kelas/${c.id}`} className="rounded-xl2 border border-navy-100 bg-white p-6 transition-colors hover:border-gold">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">{CAT[c.category]??c.category}</span>
        <h3 className="mt-2 font-semibold text-navy-900">{c.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2"><Badge>{LVL[c.level]??c.level}</Badge>{c.is_bnsp_certified && <Badge tone="gold">BNSP</Badge>}</div></Link>))}
    </div></div>);
}
