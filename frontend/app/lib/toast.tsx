"use client";
import { createContext, useCallback, useContext, useState } from "react";
type Kind = "success"|"error"|"info";
interface Toast { id:number; kind:Kind; msg:string; }
interface Ctx { show:(msg:string, kind?:Kind)=>void; }
const ToastContext = createContext<Ctx|null>(null);
export function ToastProvider({ children }:{children:React.ReactNode}) {
  const [toasts,setToasts]=useState<Toast[]>([]);
  const show=useCallback((msg:string, kind:Kind="info")=>{
    const id=Date.now()+Math.random(); setToasts(t=>[...t,{id,kind,msg}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3500);
  },[]);
  const color:Record<Kind,string>={success:"border-emerald-200 bg-emerald-50 text-emerald-800",error:"border-red-200 bg-red-50 text-red-800",info:"border-navy-100 bg-white text-navy-900"};
  return (<ToastContext.Provider value={{show}}>{children}
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t=>(<div key={t.id} className={`rounded-xl border px-4 py-2.5 text-sm shadow-sm ${color[t.kind]}`}>{t.msg}</div>))}
    </div></ToastContext.Provider>);
}
export function useToast(){ const c=useContext(ToastContext); if(!c) throw new Error("useToast harus di dalam ToastProvider"); return c; }
