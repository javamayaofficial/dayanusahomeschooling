"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
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
  return (<div>
    <h1 className="text-xl font-bold text-navy-900">Daftar akun</h1>
    <p className="mt-1 text-sm text-navy-600">Mulai perjalanan belajarmu di Dayanusa.</p>
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Input id="full_name" label="Nama lengkap" required value={form.full_name} onChange={e=>set("full_name",e.target.value)} placeholder="Nama lengkap" />
      <Input id="email" label="Email" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="nama@email.com" />
      <Input id="password" label="Kata sandi (min. 8 karakter)" type="password" required minLength={8} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" />
      <Select id="role" label="Daftar sebagai" value={form.role} onChange={e=>set("role",e.target.value as UserRole)}>
        <option value="siswa">Siswa</option><option value="orang_tua">Orang Tua</option><option value="tutor">Tutor</option></Select>
      {form.role==="siswa" && (<Select id="paket" label="Jenjang (Paket)" value={form.paket} onChange={e=>set("paket",e.target.value as PaketLevel)}>
        <option value="paket_a">Paket A (SD)</option><option value="paket_b">Paket B (SMP)</option><option value="paket_c">Paket C (SMA)</option></Select>)}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" full disabled={loading}>{loading?"Memproses…":"Daftar"}</Button></form>
    <p className="mt-5 text-center text-sm text-navy-600">Sudah punya akun? <Link href="/login" className="font-semibold text-gold-700 hover:underline">Masuk</Link></p></div>);
}
