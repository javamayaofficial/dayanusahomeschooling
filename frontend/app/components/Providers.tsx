"use client";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";

const BUILD_ID_KEY = "dayanusa-next-build-id";
const BUILD_ID_PATTERN = /"buildId":"([^"]+)"/;

export default function Providers({ children }:{children:React.ReactNode}) {
  useEffect(()=>{
    let disposed = false;

    const syncBuild = async () => {
      try {
        const res = await fetch("/", { cache: "no-store" });
        if (!res.ok) return;

        const html = await res.text();
        const nextBuildId = html.match(BUILD_ID_PATTERN)?.[1]?.trim();
        if (!nextBuildId || disposed) return;

        const currentBuildId = window.localStorage.getItem(BUILD_ID_KEY);
        if (currentBuildId && currentBuildId !== nextBuildId) {
          window.localStorage.setItem(BUILD_ID_KEY, nextBuildId);
          window.location.reload();
          return;
        }

        window.localStorage.setItem(BUILD_ID_KEY, nextBuildId);
      } catch {}
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncBuild();
    };

    void syncBuild();
    window.addEventListener("focus", syncBuild);
    document.addEventListener("visibilitychange", onVisible);

    return ()=>{
      disposed = true;
      window.removeEventListener("focus", syncBuild);
      document.removeEventListener("visibilitychange", onVisible);
    };
  },[]);

  return <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>;
}
