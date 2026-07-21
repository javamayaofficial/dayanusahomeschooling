"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAssignment, submitAssignment } from "@/lib/assignments";
import { useToast } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import MediaPreview from "@/components/MediaPreview";
import type { Assignment, MediaType } from "@/types";
function fmt(iso?:string|null){ return iso ? new Date(iso).toLocaleString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "Tanpa tenggat"; }
function guessType(url:string):MediaType{ const u=url.toLowerCase();
  if(/\.(png|jpe?g|gif|webp|svg)$/.test(u)) return "image"; if(/\.(mp4|webm|mov)$/.test(u)) return "video"; if(/\.pdf$/.test(u)) return "pdf"; return "link"; }
export default function AssignmentDetailPage() {
  const { id } = useParams<{id:string}>(); const { show } = useToast();
  const [a,setA]=useState<Assignment|null>(null); const [error,setError]=useState<string|null>(null);
  const [text,setText]=useState(""); const [fileUrl,setFileUrl]=useState(""); const [busy,setBusy]=useState(false);
  async function load(){ try{ const data=await getAssignment(id); setA(data); setText(data.my_submission?.content_text ?? ""); setFileUrl(data.my_submission?.file_url ?? ""); } catch{ setError("Tugas tidak ditemukan."); } }
  useEffect(()=>{ load(); },[id]); // eslint-disable-line react-hooks/exhaustive-deps
  const sub=a?.my_submission ?? null; const graded=sub?.status==="graded"; const locked=graded;
  async function onSubmit(e:React.FormEvent){ e.preventDefault();
    if(!text && !fileUrl){ show("Isi jawaban atau tautan berkas dulu","error"); return; }
    setBusy(true);
    try{ await submitAssignment(id,{content_text:text||undefined, file_url:fileUrl||undefined}); show("Tugas berhasil dikumpulkan","success"); await load(); }
    catch{ show("Gagal mengumpulkan tugas","error"); } finally{ setBusy(false); } }
  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!a) return <Spinner />;
  const statusBadge = !sub ? <Badge tone="navy">Belum dikumpulkan</Badge> : graded ? <Badge tone="green">Sudah dinilai</Badge> : <Badge tone="gold">Menunggu nilai</Badge>;
  return (<div className="max-w-2xl">
    <Link href="/student/assignments" className="text-sm text-navy-600 hover:underline">← Kembali ke daftar tugas</Link>
    <div className="mt-3 flex items-start justify-between gap-4"><h1 className="text-2xl font-bold text-navy-900">{a.title}</h1>{statusBadge}</div>
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600"><span>Tenggat: {fmt(a.due_date)}</span><span>· Nilai maksimal: {a.max_score}</span></div>
    {a.description && <p className="mt-4 whitespace-pre-wrap text-navy-700">{a.description}</p>}
    {graded && (<div className="mt-6 rounded-xl2 border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center justify-between"><h3 className="font-semibold text-emerald-900">Hasil Penilaian</h3>
        <p className="text-2xl font-extrabold text-emerald-900">{sub?.grade} <span className="text-sm font-medium">/ {a.max_score}</span></p></div>
      {sub?.feedback && <p className="mt-2 text-sm text-emerald-900">Feedback tutor: {sub.feedback}</p>}</div>)}
    {sub && (<div className="mt-6 rounded-xl2 border border-navy-100 bg-white p-5"><h3 className="font-semibold text-navy-900">Pengumpulan Kamu</h3>
      {sub.content_text && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-700">{sub.content_text}</p>}
      {sub.file_url && (<div className="mt-3"><MediaPreview type={guessType(sub.file_url)} url={sub.file_url} className="aspect-video max-w-sm" />
        <a href={sub.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-gold-700 hover:underline">Buka berkas ↗</a></div>)}</div>)}
    {!locked && (<form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl2 border border-navy-100 bg-white p-5">
      <h3 className="font-semibold text-navy-900">{sub?"Kirim Ulang":"Kumpulkan Tugas"}</h3>
      <Textarea id="text" label="Jawaban / catatan" value={text} onChange={e=>setText(e.target.value)} placeholder="Tulis jawaban atau deskripsi karyamu…" />
      <Input id="file" label="Tautan berkas (Google Drive, YouTube, dsb.)" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} placeholder="https://…" />
      {fileUrl && <MediaPreview type={guessType(fileUrl)} url={fileUrl} className="aspect-video max-w-sm" />}
      <p className="text-xs text-navy-500">Catatan: unggah berkas langsung ke penyimpanan awan akan ditambahkan di iterasi backend berikutnya. Untuk sekarang, tempel tautan berkas.</p>
      <Button type="submit" disabled={busy}>{busy?"Mengirim…":sub?"Kirim Ulang":"Kumpulkan"}</Button></form>)}
  </div>);
}
