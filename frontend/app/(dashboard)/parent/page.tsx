"use client";
import { useAuth } from "@/lib/auth";
export default function ParentDashboard(){ const {user}=useAuth();
  return (<div><h1 className="text-2xl font-bold text-navy-900">Dashboard Orang Tua</h1>
    <p className="mt-1 text-navy-600">Selamat datang, {user?.full_name}.</p>
    <div className="mt-6 rounded-xl2 border border-navy-100 bg-white p-6"><h3 className="font-semibold text-navy-900">Pemantauan Anak</h3>
    <p className="mt-2 text-sm text-navy-600">Progres, nilai, dan portofolio anak akan tampil setelah akun anak ditautkan.</p></div></div>);
}
