"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import type { PaketLevel, UserRole } from "@/types";
export default function RegisterPage() {
  const { register } = useAuth(); const router = useRouter();
  const [form,setForm]=useState({full_name:"",email:"",password:"",role:"siswa" as UserRole,paket:"paket_c" as PaketLevel});
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  function set<K extends keyof typeof form>(k:K,v:(typeof form)[K]){ setForm(f=>({...f,[k]:v})); }
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setError(null); setLoading(true);
    try { const u=await register({full_name:form.full_name,email:form.email,password:form.password,role:form.role,...(form.role==="siswa"?{paket:form.paket}:{})}); router.push(dashboardPathFor(u.role)); }
    catch(err){ setError(err instanceof ApiError ? err.message : "Gagal mendaftar."); } finally{ setLoading(false); } }
  return (<div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_460px]">
    <section className="order-2 overflow-hidden rounded-[32px] border border-navy-100 bg-gradient-to-br from-navy-900 via-navy-900 to-[#173b68] p-6 text-white shadow-soft sm:p-8 lg:order-1">
      <Badge tone="gold">Mulai perjalanan belajar</Badge>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Buat akun Dayanusa untuk membuka jalur ijazah, skill, dan portofolio dalam satu sistem.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">Setelah terdaftar, siswa bisa langsung masuk ke dashboard belajar, orang tua memantau progres, dan tutor mengawal tugas serta feedback.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-200">Siswa</p>
          <p className="mt-2 font-semibold">Belajar terarah</p>
          <p className="mt-2 text-sm leading-6 text-white/75">Akses modul, kelas skill, tugas, portofolio, dan Guru AI.</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-200">Orang Tua</p>
          <p className="mt-2 font-semibold">Pantau progres</p>
          <p className="mt-2 text-sm leading-6 text-white/75">Melihat perkembangan belajar dan capaian anak dengan lebih jelas.</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-200">Tutor</p>
          <p className="mt-2 font-semibold">Dampingi kelas</p>
          <p className="mt-2 text-sm leading-6 text-white/75">Kelola feedback, penilaian, dan ritme belajar siswa.</p>
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Yang akan kamu dapatkan</p>
        <div className="mt-4 space-y-3 text-sm text-white/80">
          <p>Modul formal PKBM dengan progres yang terpantau.</p>
          <p>Kelas vokasi dengan alur materi, tugas, dan penilaian yang rapi.</p>
          <p>Portofolio karya untuk membangun bukti hasil belajar yang nyata.</p>
        </div>
      </div>
    </section>
    <section className="order-1 rounded-[32px] border border-navy-100 bg-white p-6 shadow-soft sm:p-8 lg:order-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Registrasi</p>
      <h2 className="mt-2 text-2xl font-bold text-navy-900">Daftar akun baru</h2>
      <p className="mt-2 text-sm leading-6 text-navy-600">Isi data dasar di bawah ini. Setelah akun dibuat, sistem akan langsung mengarahkanmu ke dashboard sesuai peran.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="navy">Akses langsung</Badge>
        <Badge tone="gold">Peran otomatis</Badge>
        <Badge tone="green">Belajar terstruktur</Badge>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input id="full_name" label="Nama lengkap" required value={form.full_name} onChange={e=>set("full_name",e.target.value)} placeholder="Nama lengkap" />
        <Input id="email" label="Email" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="nama@email.com" />
        <Input id="password" label="Kata sandi (min. 8 karakter)" type="password" required minLength={8} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" />
        <Select id="role" label="Daftar sebagai" value={form.role} onChange={e=>set("role",e.target.value as UserRole)}>
          <option value="siswa">Siswa</option><option value="orang_tua">Orang Tua</option><option value="tutor">Tutor</option></Select>
        {form.role==="siswa" && (<Select id="paket" label="Jenjang (Paket)" value={form.paket} onChange={e=>set("paket",e.target.value as PaketLevel)}>
          <option value="paket_a">Paket A (SD)</option><option value="paket_b">Paket B (SMP)</option><option value="paket_c">Paket C (SMA)</option></Select>)}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" full disabled={loading}>{loading?"Memproses…":"Buat akun sekarang"}</Button>
      </form>
      <div className="mt-5 rounded-[24px] border border-gold-100 bg-gold-50/60 p-4">
        <p className="text-sm font-semibold text-navy-900">Pilihan peran yang paling umum</p>
        <p className="mt-2 text-sm leading-6 text-navy-600">Pilih `Siswa` untuk belajar langsung, `Orang Tua` untuk memantau, dan `Tutor` untuk mendampingi proses belajar.</p>
      </div>
      <p className="mt-5 text-center text-sm text-navy-600">Sudah punya akun? <Link href="/login" className="font-semibold text-gold-700 hover:underline">Masuk</Link></p>
    </section></div>);
}
