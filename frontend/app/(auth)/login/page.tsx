"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
export default function LoginPage() {
  const { login } = useAuth(); const router = useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setError(null); setLoading(true);
    try { const u=await login({email,password}); router.push(dashboardPathFor(u.role)); }
    catch(err){ setError(err instanceof ApiError ? err.message : "Gagal masuk."); } finally{ setLoading(false); } }
  return (<div>
    <h1 className="text-xl font-bold text-navy-900">Masuk</h1>
    <p className="mt-1 text-sm text-navy-600">Lanjutkan belajar di Dayanusa.</p>
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Input id="email" label="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" />
      <Input id="password" label="Kata sandi" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" full disabled={loading}>{loading?"Memproses…":"Masuk"}</Button></form>
    <p className="mt-5 text-center text-sm text-navy-600">Belum punya akun? <Link href="/register" className="font-semibold text-gold-700 hover:underline">Daftar</Link></p></div>);
}
