"use client";
import { useEffect, useState } from "react";
import { getMyPortfolios, createPortfolio, updatePortfolio, deletePortfolio } from "@/lib/portfolio";
import { useToast } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Field";
import MediaPreview from "@/components/MediaPreview";
import type { MediaType, Portfolio, PortfolioCategory, PortfolioPayload } from "@/types";
const CAT_LABEL:Record<string,string>={digital_marketing:"Digital Marketing",content_creator:"Content Creator",product_creator:"Product Creator",other:"Lainnya"};
const emptyForm:PortfolioPayload={title:"",description:"",media_type:"image",media_url:"",category:"digital_marketing",is_for_sale:false,price:null,is_published:true};
export default function MyPortfolioPage() {
  const { show } = useToast();
  const [items,setItems]=useState<Portfolio[]|null>(null); const [error,setError]=useState<string|null>(null);
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Portfolio|null>(null);
  const [form,setForm]=useState<PortfolioPayload>(emptyForm); const [busy,setBusy]=useState(false);
  async function load(){ try{ setItems(await getMyPortfolios()); } catch{ setError("Gagal memuat portofolio."); } }
  useEffect(()=>{ load(); },[]);
  function set<K extends keyof PortfolioPayload>(k:K,v:PortfolioPayload[K]){ setForm(f=>({...f,[k]:v})); }
  function openCreate(){ setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(p:Portfolio){ setEditing(p); setForm({title:p.title,description:p.description??"",media_type:p.media_type,media_url:p.media_url,category:p.category,is_for_sale:p.is_for_sale,price:p.price??null,is_published:p.is_published}); setOpen(true); }
  async function save(e:React.FormEvent){ e.preventDefault();
    if(!form.title||!form.media_url){ show("Judul dan media wajib diisi","error"); return; }
    setBusy(true);
    try{ const payload={...form, price: form.is_for_sale?form.price:null};
      if(editing){ await updatePortfolio(editing.id,payload); show("Karya diperbarui","success"); }
      else { await createPortfolio(payload); show("Karya ditambahkan","success"); }
      setOpen(false); await load(); }
    catch{ show("Gagal menyimpan karya","error"); } finally{ setBusy(false); } }
  async function remove(p:Portfolio){ if(!confirm(`Hapus karya "${p.title}"?`)) return;
    try{ await deletePortfolio(p.id); show("Karya dihapus","success"); await load(); } catch{ show("Gagal menghapus karya","error"); } }
  return (<div>
    <div className="flex items-center justify-between"><div>
      <h1 className="text-2xl font-bold text-navy-900">Portofolio Saya</h1>
      <p className="mt-1 text-navy-600">Kumpulkan karyamu dan pamerkan ke publik.</p></div>
      <Button onClick={openCreate}>+ Tambah Karya</Button></div>
    {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {!items && !error && <Spinner />}
    {items && items.length===0 && <p className="mt-6 rounded-xl2 border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-navy-600">Belum ada karya. Klik "Tambah Karya" untuk memulai.</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items?.map(p=>(<div key={p.id} className="overflow-hidden rounded-xl2 border border-navy-100 bg-white">
        <MediaPreview type={p.media_type} url={p.media_url} className="aspect-video" />
        <div className="p-4"><div className="flex flex-wrap items-center gap-2"><Badge tone="gold">{CAT_LABEL[p.category]}</Badge>
          {!p.is_published && <Badge tone="gray">Draft</Badge>}{p.is_for_sale && <Badge tone="green">Dijual</Badge>}</div>
          <h3 className="mt-2 font-semibold text-navy-900">{p.title}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-navy-600"><span>❤ {p.likes_count}</span><span>👁 {p.views_count}</span>
            {p.is_for_sale && p.price!=null && <span>· Rp{p.price.toLocaleString("id-ID")}</span>}</div>
          <div className="mt-3 flex gap-2"><button onClick={()=>openEdit(p)} className="rounded-full border border-navy-100 px-3 py-1 text-xs font-medium text-navy-900 hover:bg-navy-50">Edit</button>
            <button onClick={()=>remove(p)} className="rounded-full border border-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Hapus</button></div></div></div>))}
    </div>
    <Modal open={open} onClose={()=>setOpen(false)} title={editing?"Edit Karya":"Tambah Karya"}>
      <form onSubmit={save} className="space-y-4">
        <Input id="title" label="Judul" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Judul karya" required />
        <Textarea id="desc" label="Deskripsi" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Ceritakan tentang karyamu…" />
        <div className="grid grid-cols-2 gap-3">
          <Select id="cat" label="Kategori" value={form.category} onChange={e=>set("category",e.target.value as PortfolioCategory)}>
            <option value="digital_marketing">Digital Marketing</option><option value="content_creator">Content Creator</option>
            <option value="product_creator">Product Creator</option><option value="other">Lainnya</option></Select>
          <Select id="mtype" label="Tipe media" value={form.media_type} onChange={e=>set("media_type",e.target.value as MediaType)}>
            <option value="image">Gambar</option><option value="video">Video</option><option value="pdf">PDF</option><option value="link">Tautan</option></Select></div>
        <Input id="murl" label="Tautan media" value={form.media_url} onChange={e=>set("media_url",e.target.value)} placeholder="https://…" required />
        {form.media_url && <MediaPreview type={form.media_type} url={form.media_url} className="aspect-video" />}
        <label className="flex items-center gap-2 text-sm text-navy-900"><input type="checkbox" checked={form.is_for_sale} onChange={e=>set("is_for_sale",e.target.checked)} className="h-4 w-4 rounded border-navy-100" />Karya ini dijual</label>
        {form.is_for_sale && <Input id="price" label="Harga (Rp)" type="number" min={0} value={form.price ?? ""} onChange={e=>set("price", e.target.value?Number(e.target.value):null)} placeholder="50000" />}
        <label className="flex items-center gap-2 text-sm text-navy-900"><input type="checkbox" checked={form.is_published} onChange={e=>set("is_published",e.target.checked)} className="h-4 w-4 rounded border-navy-100" />Publikasikan (tampil di showcase publik)</label>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Batal</Button><Button type="submit" disabled={busy}>{busy?"Menyimpan…":"Simpan"}</Button></div>
      </form></Modal>
  </div>);
}
