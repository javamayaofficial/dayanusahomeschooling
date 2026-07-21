"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPortfolio, likePortfolio } from "@/lib/portfolio";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import MediaPreview from "@/components/MediaPreview";
import type { Portfolio } from "@/types";
const CAT_LABEL:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator",other:"Lainnya"};
export default function PublicPortfolioDetail() {
  const { id } = useParams<{id:string}>(); const router=useRouter(); const { user }=useAuth(); const { show }=useToast();
  const [p,setP]=useState<Portfolio|null>(null); const [error,setError]=useState<string|null>(null);
  const [likes,setLikes]=useState(0); const [liked,setLiked]=useState(false); const [busy,setBusy]=useState(false);
  useEffect(()=>{ getPortfolio(id).then(d=>{setP(d); setLikes(d.likes_count);}).catch(()=>setError("Karya tidak ditemukan.")); },[id]);
  async function onLike(){ if(!user){ show("Masuk dulu untuk menyukai karya","info"); router.push("/login"); return; }
    setBusy(true); try{ const res=await likePortfolio(id); setLiked(res.liked); setLikes(res.likes_count); } catch{ show("Gagal menyukai karya","error"); } finally{ setBusy(false); } }
  if (error) return (<div className="mx-auto max-w-3xl px-6 py-16"><p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
    <Link href="/portofolio" className="mt-4 inline-block text-sm text-navy-600 hover:underline">← Kembali ke showcase</Link></div>);
  if (!p) return <div className="mx-auto max-w-3xl px-6 py-16"><Spinner /></div>;
  return (<div className="min-h-screen bg-navy-50">
    <header className="border-b border-navy-100 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
      <Link href="/portofolio" className="text-sm text-navy-600 hover:underline">← Showcase</Link>
      <Link href="/" className="text-sm font-extrabold tracking-tight text-navy-900">DAYANUSA</Link></div></header>
    <main className="mx-auto max-w-4xl px-6 py-10">
      <MediaPreview type={p.media_type} url={p.media_url} className="aspect-video w-full" />
      <div className="mt-6 flex flex-wrap items-center gap-2"><Badge tone="gold">{CAT_LABEL[p.category]}</Badge>{p.is_for_sale && <Badge tone="green">Karya Ini Dijual</Badge>}</div>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-900">{p.title}</h1>
      {p.description && <p className="mt-3 whitespace-pre-wrap text-navy-700">{p.description}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-navy-600"><span>👁 {p.views_count} dilihat</span><span>❤ {likes} suka</span>
        {p.is_for_sale && p.price!=null && <span className="rounded-full bg-gold-50 px-3 py-1 font-semibold text-gold-700">Rp{p.price.toLocaleString("id-ID")}</span>}</div>
      <button onClick={onLike} disabled={busy} className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${liked?"bg-red-50 text-red-700":"bg-navy-900 text-white hover:bg-navy-600"}`}>
        {liked?"❤ Disukai":"🤍 Suka"} {busy && "…"}</button>
      {p.is_for_sale && (<div className="mt-8 rounded-xl2 border border-gold-600/30 bg-gold-50 p-5"><p className="text-sm text-navy-700">Tertarik dengan karya ini? Hubungi Dayanusa untuk informasi pembelian karya siswa.</p></div>)}
    </main></div>);
}
