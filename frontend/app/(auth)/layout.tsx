import Link from "next/link";
export default function AuthLayout({ children }:{children:React.ReactNode}) {
  return (<div className="min-h-screen bg-navy-50 px-4 py-8 sm:px-6 sm:py-10">
    <div className="mx-auto w-full max-w-6xl">
      <Link href="/" className="mb-6 block text-center leading-none sm:mb-8">
        <span className="text-2xl font-extrabold tracking-tight text-navy-900">DAYANUSA</span>
        <span className="block text-[10px] font-semibold tracking-[0.35em] text-gold-600">HOMESCHOOLING</span>
      </Link>
      {children}
    </div>
  </div>);
}
