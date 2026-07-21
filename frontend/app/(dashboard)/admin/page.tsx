"use client";
import { useAuth } from "@/lib/auth";
export default function AdminDashboard(){ const {user}=useAuth();
  return (<div><h1 className="text-2xl font-bold text-navy-900">Dashboard Admin</h1>
    <p className="mt-1 text-navy-600">Masuk sebagai {user?.full_name}.</p></div>);
}
