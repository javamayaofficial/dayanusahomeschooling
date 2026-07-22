"use client";
import { useEffect, useMemo, useState } from "react";
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
function daysMeta(iso?:string|null){
  if (!iso) return { label:"Tanpa tenggat", tone:"navy" as const };
  const days = Math.ceil((new Date(iso).getTime() - Date.now())/86400000);
  if (days < 0) return { label:"Terlambat", tone:"red" as const };
  if (days === 0) return { label:"Hari ini", tone:"red" as const };
  if (days <= 3) return { label:`${days} hari lagi`, tone:"gold" as const };
  return { label:`${days} hari lagi`, tone:"navy" as const };
}
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
  const dueMeta = daysMeta(a.due_date);
  const statusTimeline = useMemo(()=>[
    {
      title:"Tugas aktif",
      description:`Instruksi sudah tersedia${a.due_date ? ` sampai ${fmt(a.due_date)}` : ""}.`,
      done:true,
    },
    {
      title:"Submission masuk",
      description:sub?.submitted_at ? `Dikirim pada ${fmt(sub.submitted_at)}.` : "Belum ada submission yang dikirim.",
      done:Boolean(sub),
    },
    {
      title:"Review tutor",
      description:graded ? `Feedback akhir tersedia${sub?.graded_at ? ` pada ${fmt(sub.graded_at)}` : ""}.` : sub ? "Tutor akan menilai submission ini setelah direview." : "Tahap review dimulai setelah kamu submit tugas.",
      done:Boolean(graded),
    },
  ],[a.due_date,graded,sub]);
  const submitHelper = graded
    ? "Submission sudah dinilai. Gunakan feedback tutor untuk memperbaiki kualitas karya berikutnya."
    : sub
      ? "Kamu sudah mengirim submission. Jika masih perlu revisi sebelum dinilai, kirim ulang dari panel ini."
      : "Isi jawaban atau tempel tautan karya agar tutor bisa langsung menilai hasil belajarmu.";
  return (<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="min-w-0">
    <Link href="/student/assignments" className="text-sm text-navy-600 hover:underline">← Kembali ke daftar tugas</Link>
    <section className="mt-3 rounded-[28px] border border-navy-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {statusBadge}
            <Badge tone={dueMeta.tone}>{dueMeta.label}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-navy-900">{a.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600"><span>Tenggat: {fmt(a.due_date)}</span><span>· Nilai maksimal: {a.max_score}</span></div>
        </div>
        <div className="rounded-[22px] border border-gold-100 bg-gold-50/70 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Workflow</p>
          <p className="mt-1 text-sm font-semibold text-navy-900">{graded ? "Review selesai" : sub ? "Menunggu review tutor" : "Siap dikumpulkan"}</p>
        </div>
      </div>
      {a.description && <p className="mt-4 whitespace-pre-wrap leading-7 text-navy-700">{a.description}</p>}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {statusTimeline.map((item, index)=>(
          <div key={item.title} className={`rounded-[24px] border p-4 ${item.done ? "border-emerald-100 bg-emerald-50/70" : "border-navy-100 bg-navy-50/45"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">Tahap {index+1}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-navy-500"}`}>
                {item.done ? "✓" : index+1}
              </span>
            </div>
            <p className="mt-3 font-semibold text-navy-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-navy-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
    {graded && (<div className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center justify-between"><h3 className="font-semibold text-emerald-900">Hasil Penilaian</h3>
        <p className="text-2xl font-extrabold text-emerald-900">{sub?.grade} <span className="text-sm font-medium">/ {a.max_score}</span></p></div>
      {sub?.feedback && <p className="mt-2 text-sm text-emerald-900">Feedback tutor: {sub.feedback}</p>}</div>)}
    {sub && (<div className="mt-6 rounded-[28px] border border-navy-100 bg-white p-5 shadow-soft"><h3 className="font-semibold text-navy-900">Pengumpulan Kamu</h3>
      <p className="mt-2 text-sm text-navy-600">{sub.submitted_at ? `Versi aktif dikirim pada ${fmt(sub.submitted_at)}.` : "Submission tersimpan."}</p>
      {sub.content_text && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-700">{sub.content_text}</p>}
      {sub.file_url && (<div className="mt-3"><MediaPreview type={guessType(sub.file_url)} url={sub.file_url} className="aspect-video max-w-sm" />
        <a href={sub.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-gold-700 hover:underline">Buka berkas ↗</a></div>)}</div>)}
    {!locked && (<form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-[28px] border border-navy-100 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-900">{sub?"Kirim Ulang":"Kumpulkan Tugas"}</h3>
          <p className="mt-1 text-sm leading-6 text-navy-600">{submitHelper}</p>
        </div>
        <Badge tone={sub ? "gold" : "navy"}>{sub ? "Revisi submission" : "Panel submit"}</Badge>
      </div>
      <Textarea id="text" label="Jawaban / catatan" value={text} onChange={e=>setText(e.target.value)} placeholder="Tulis jawaban atau deskripsi karyamu…" />
      <Input id="file" label="Tautan berkas (Google Drive, YouTube, dsb.)" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} placeholder="https://…" />
      {fileUrl && <MediaPreview type={guessType(fileUrl)} url={fileUrl} className="aspect-video max-w-sm" />}
      <p className="text-xs text-navy-500">Catatan: unggah berkas langsung ke penyimpanan awan akan ditambahkan di iterasi backend berikutnya. Untuk sekarang, tempel tautan berkas.</p>
      <Button type="submit" disabled={busy}>{busy?"Mengirim…":sub?"Kirim Ulang":"Kumpulkan"}</Button></form>)}
    </div>
    <aside className="self-start rounded-[28px] border border-navy-100 bg-white p-5 shadow-soft lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Panel review cepat</p>
      <h2 className="mt-2 text-lg font-semibold text-navy-900">Yang perlu kamu perhatikan sebelum submit</h2>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-sm font-semibold text-navy-900">Status tugas</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">{graded ? "Submission sudah selesai dinilai tutor." : sub ? "Submission aktif sudah masuk, kamu masih bisa cek dan revisi jika perlu." : "Belum ada submission. Gunakan panel kiri untuk mengirim tugas."}</p>
        </div>
        <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-sm font-semibold text-navy-900">Deadline</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={dueMeta.tone}>{dueMeta.label}</Badge>
            <span className="text-xs text-navy-500">{fmt(a.due_date)}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-sm font-semibold text-navy-900">Target nilai</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{a.max_score}</p>
          <p className="mt-1 text-sm text-navy-600">Skor maksimum untuk tugas ini.</p>
        </div>
      </div>
      {!graded && (
        <button
          type="button"
          onClick={()=>window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          className="mt-5 w-full rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          {sub ? "Lihat panel kirim ulang" : "Buka panel submit"}
        </button>
      )}
    </aside>
  </div>);
}
