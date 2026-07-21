import Link from "next/link";
export default function AuthLayout({ children }:{children:React.ReactNode}) {
  return (<div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-10">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-6 block text-center leading-none">
        <span className="text-2xl font-extrabold tracking-tight text-navy-900">DAYANUSA</span>
        <span className="block text-[10px] font-semibold tracking-[0.35em] text-gold-600">HOMESCHOOLING</span></Link>
      <div className="rounded-xl2 border border-navy-100 bg-white p-7 shadow-sm">{children}</div></div></div>);
}
