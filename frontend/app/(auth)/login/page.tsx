"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
export default function LoginPage() {
  const { login } = useAuth(); const router = useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setError(null); setLoading(true);
    try { const u=await login({email,password}); router.push(dashboardPathFor(u.role)); }
    catch(err){ setError(err instanceof ApiError ? err.message : "Gagal masuk."); } finally{ setLoading(false); } }
  return (<div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_420px]">
    <section className="order-2 overflow-hidden rounded-[32px] border border-navy-100 bg-gradient-to-br from-white via-[#fffdfa] to-gold-50/60 p-6 shadow-soft sm:p-8 lg:order-1">
      <Badge tone="gold">Portal belajar premium</Badge>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">Masuk ke Dayanusa dan lanjutkan ritme belajar tanpa kehilangan progres.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-navy-600 sm:text-base">Satu akun untuk mengakses modul PKBM, kelas soft skill, tugas praktik, portofolio karya, dan pendampingan Guru AI yang selalu siap membantu.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white bg-white/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Formal</p>
          <p className="mt-2 font-semibold text-navy-900">Ijazah PKBM</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">Modul akademik tetap rapi dan terpantau per progres.</p>
        </div>
        <div className="rounded-[24px] border border-white bg-white/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Skill</p>
          <p className="mt-2 font-semibold text-navy-900">Kelas vokasi</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">Belajar materi praktis, tugas, dan evaluasi dalam flow ala LMS.</p>
        </div>
        <div className="rounded-[24px] border border-white bg-white/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">AI Support</p>
          <p className="mt-2 font-semibold text-navy-900">Guru AI 24 jam</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">Tanya konsep, minta ringkasan, sampai strategi menyelesaikan tugas.</p>
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-navy-100 bg-navy-900 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Kenapa siswa betah lanjut belajar</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="mt-1 text-sm text-white/75">Akses pembelajaran dan pendamping AI kapan saja.</p>
          </div>
          <div>
            <p className="text-2xl font-bold">BNSP</p>
            <p className="mt-1 text-sm text-white/75">Jalur skill diarahkan ke capaian kerja yang nyata.</p>
          </div>
          <div>
            <p className="text-2xl font-bold">1 akun</p>
            <p className="mt-1 text-sm text-white/75">Modul, tugas, portofolio, dan progres menyatu.</p>
          </div>
        </div>
      </div>
    </section>
    <section className="order-1 rounded-[32px] border border-navy-100 bg-white p-6 shadow-soft sm:p-8 lg:order-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Masuk</p>
      <h2 className="mt-2 text-2xl font-bold text-navy-900">Lanjutkan belajar di Dayanusa.</h2>
      <p className="mt-2 text-sm leading-6 text-navy-600">Gunakan akun yang sudah terdaftar untuk kembali ke dashboard sesuai peranmu.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="navy">Dashboard siswa</Badge>
        <Badge tone="gold">Progress tracker</Badge>
        <Badge tone="green">Portofolio karya</Badge>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input id="email" label="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" />
        <Input id="password" label="Kata sandi" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" full disabled={loading}>{loading?"Memproses…":"Masuk ke dashboard"}</Button>
      </form>
      <div className="mt-5 rounded-[24px] border border-gold-100 bg-gold-50/60 p-4">
        <p className="text-sm font-semibold text-navy-900">Akses cepat setelah login</p>
        <p className="mt-2 text-sm leading-6 text-navy-600">Siswa masuk ke area belajar, orang tua ke pemantauan anak, dan tutor ke area pendampingan sesuai peran.</p>
      </div>
      <p className="mt-5 text-center text-sm text-navy-600">Belum punya akun? <Link href="/register" className="font-semibold text-gold-700 hover:underline">Daftar</Link></p>
    </section></div>);
}
