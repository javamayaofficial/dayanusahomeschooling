"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
const ROLE_LABEL:Record<string,string>={siswa:"Siswa",orang_tua:"Orang Tua",tutor:"Tutor",admin_pkbm:"Admin PKBM",admin_lsp:"Admin LSP",admin_yayasan:"Admin Yayasan"};
const STUDENT_NAV=[{href:"/student",label:"Beranda"},{href:"/modul",label:"Modul"},{href:"/kelas",label:"Kelas"},{href:"/student/assignments",label:"Tugas"},{href:"/student/portfolio",label:"Portofolio"},{href:"/student/chat",label:"Guru AI"}];
export default function DashboardLayout({ children }:{children:React.ReactNode}) {
  const { user, loading, logout } = useAuth(); const router=useRouter(); const pathname=usePathname();
  useEffect(()=>{ if(!loading && !user) router.replace("/login"); },[loading,user,router]);
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-sm text-navy-600">Memuat…</div>;
  return (<div className="min-h-screen bg-navy-50">
    <header className="border-b border-navy-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href={user.role==="siswa"?"/student":"/"} className="leading-none">
            <span className="text-lg font-extrabold tracking-tight text-navy-900">DAYANUSA</span>
            <span className="block text-[9px] font-semibold tracking-[0.3em] text-gold-600">HOMESCHOOLING</span></Link>
          {user.role==="siswa" && (<nav className="hidden gap-5 text-sm lg:flex">
            {STUDENT_NAV.map(n=>{ const active = n.href==="/student" ? pathname==="/student" : (pathname===n.href||pathname.startsWith(n.href+"/"));
              return <Link key={n.href} href={n.href} className={active?"font-semibold text-navy-900":"text-navy-600 hover:text-navy-900"}>{n.label}</Link>; })}
          </nav>)}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-navy-600 sm:inline">{user.full_name} · <span className="text-gold-700">{ROLE_LABEL[user.role]}</span></span>
          <button onClick={()=>{logout(); router.replace("/login");}} className="rounded-full border border-navy-100 px-4 py-1.5 font-medium text-navy-900 hover:bg-navy-50">Keluar</button>
        </div>
      </div></header>
    <main className="mx-auto max-w-6xl px-6 py-8">{children}</main></div>);
}
