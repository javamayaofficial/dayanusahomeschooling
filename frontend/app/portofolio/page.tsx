"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getPublicPortfolios } from "@/lib/portfolio";
import { useAuth } from "@/lib/auth";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import MediaPreview from "@/components/MediaPreview";
import type { Portfolio } from "@/types";
const LIMIT=10;
const FILTERS=[{key:"",label:"Semua"},{key:"digital_marketing",label:"Digital Marketing"},{key:"content_creator",label:"Content Creator"},{key:"product_creator",label:"Product Creator"}];
const CAT_LABEL:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator",other:"Lainnya"};
export default function PublicShowcasePage() {
  const { user, loading } = useAuth();
  const [items,setItems]=useState<Portfolio[]|null>(null); const [total,setTotal]=useState(0);
  const [category,setCategory]=useState(""); const [page,setPage]=useState(0); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{ setItems(null);
    try{ const res=await getPublicPortfolios({category:category||undefined,limit:LIMIT,offset:page*LIMIT}); setItems(res.items); setTotal(res.total); }
    catch{ setError("Gagal memuat karya."); } },[category,page]);
  useEffect(()=>{ load(); },[load]);
  const totalPages=Math.max(1,Math.ceil(total/LIMIT));
  return (<div className="min-h-screen bg-navy-50">
    <header className="border-b border-navy-100 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" className="leading-none"><span className="text-lg font-extrabold tracking-tight text-navy-900">DAYANUSA</span>
        <span className="block text-[9px] font-semibold tracking-[0.3em] text-gold-600">HOMESCHOOLING</span></Link>
      <div className="text-sm">{!loading && (user? <Link href="/student/portfolio" className="font-medium text-navy-900 hover:underline">Portofolio Saya</Link>
        : <Link href="/login" className="font-medium text-navy-900 hover:underline">Masuk</Link>)}</div></div></header>
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-navy-900">Showcase Karya Siswa</h1>
      <div className="rule-gold mt-4" />
      <p className="mt-4 max-w-xl text-navy-600">Karya nyata hasil belajar siswa Dayanusa — dari desain, konten, hingga produk digital.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map(f=>(<button key={f.key} onClick={()=>{setCategory(f.key); setPage(0);}} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category===f.key?"bg-navy-900 text-white":"border border-navy-100 bg-white text-navy-600 hover:bg-navy-50"}`}>{f.label}</button>))}
      </div>
      {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length===0 && <p className="mt-8 rounded-xl2 border border-dashed border-navy-100 bg-white p-10 text-center text-sm text-navy-600">Belum ada karya pada kategori ini.</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map(p=>(<Link key={p.id} href={`/portofolio/${p.id}`} className="group overflow-hidden rounded-xl2 border border-navy-100 bg-white transition-colors hover:border-gold">
          <MediaPreview type={p.media_type} url={p.media_url} className="aspect-video" />
          <div className="p-4"><div className="flex flex-wrap items-center gap-2"><Badge tone="gold">{CAT_LABEL[p.category]}</Badge>{p.is_for_sale && <Badge tone="green">Dijual</Badge>}</div>
            <h3 className="mt-2 font-semibold text-navy-900 group-hover:text-gold-700">{p.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-navy-600"><span>❤ {p.likes_count}</span><span>👁 {p.views_count}</span></div></div></Link>))}
      </div>
      {total>LIMIT && (<div className="mt-8 flex items-center justify-center gap-4">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="rounded-full border border-navy-100 bg-white px-4 py-1.5 text-sm font-medium text-navy-900 disabled:opacity-50 hover:bg-navy-50">← Sebelumnya</button>
        <span className="text-sm text-navy-600">Halaman {page+1} dari {totalPages}</span>
        <button disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)} className="rounded-full border border-navy-100 bg-white px-4 py-1.5 text-sm font-medium text-navy-900 disabled:opacity-50 hover:bg-navy-50">Berikutnya →</button></div>)}
    </main></div>);
}
