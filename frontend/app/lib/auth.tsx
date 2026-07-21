"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import type { AuthResponse, RegisterPayload, User } from "@/types";
type LoginData = { email: string; password: string };
const TOKEN_KEY="dayanusa_access"; const REFRESH_KEY="dayanusa_refresh";
interface Ctx { user:User|null; loading:boolean; login:(d:LoginData)=>Promise<User>; register:(d:RegisterPayload)=>Promise<User>; logout:()=>void; }
const AuthContext = createContext<Ctx|null>(null);
function save(a:string,r:string){ localStorage.setItem(TOKEN_KEY,a); localStorage.setItem(REFRESH_KEY,r); }
function clear(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); }
export function getAccessToken(){ if(typeof window==="undefined") return null; return localStorage.getItem(TOKEN_KEY); }
export function AuthProvider({ children }:{children:React.ReactNode}) {
  const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ const t=getAccessToken(); if(!t){setLoading(false);return;}
    apiFetch<User>("/auth/me",{token:t}).then(setUser).catch(()=>clear()).finally(()=>setLoading(false)); },[]);
  const login=useCallback(async(d:LoginData)=>{ const r=await apiFetch<AuthResponse>("/auth/login",{method:"POST",body:JSON.stringify(d)}); save(r.tokens.access_token,r.tokens.refresh_token); setUser(r.user); return r.user; },[]);
  const register=useCallback(async(d:RegisterPayload)=>{ const r=await apiFetch<AuthResponse>("/auth/register",{method:"POST",body:JSON.stringify(d)}); save(r.tokens.access_token,r.tokens.refresh_token); setUser(r.user); return r.user; },[]);
  const logout=useCallback(()=>{ clear(); setUser(null); },[]);
  const value=useMemo(()=>({user,loading,login,register,logout}),[user,loading,login,register,logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){ const c=useContext(AuthContext); if(!c) throw new Error("useAuth harus di dalam AuthProvider"); return c; }
export function dashboardPathFor(role:User["role"]):string{ if(role==="siswa") return "/student"; if(role==="orang_tua") return "/parent"; return "/admin"; }
