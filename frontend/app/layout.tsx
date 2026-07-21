import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
const jakarta = Plus_Jakarta_Sans({ subsets:["latin"], weight:["400","500","600","700","800"], variable:"--font-jakarta", display:"swap" });
export const metadata: Metadata = { title:"Dayanusa Homeschooling", description:"Ijazah PKBM + Sertifikat BNSP + Portofolio Karya + Guru AI." };
export default function RootLayout({ children }:{children:React.ReactNode}) {
  return (<html lang="id" className={jakarta.variable}><body className="font-sans"><Providers>{children}</Providers></body></html>);
}
