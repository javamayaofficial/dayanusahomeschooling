import Link from "next/link";
export default function HomePage() {
  return (<main className="min-h-screen bg-navy-900 text-white">
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <div className="leading-none"><span className="text-xl font-extrabold tracking-tight">DAYANUSA</span>
        <span className="block text-[10px] font-semibold tracking-[0.35em] text-gold">HOMESCHOOLING</span></div>
      <div className="flex items-center gap-5 text-sm">
        <Link href="/portofolio" className="text-navy-100 hover:text-white">Showcase Karya</Link>
        <Link href="/login" className="text-navy-100 hover:text-white">Masuk</Link></div>
    </header>
    <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-24">
      <p className="mb-5 inline-block rounded-full border border-navy-600 px-4 py-1 text-xs text-gold">Yayasan Pondok Daya Cipta Nusantara</p>
      <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] md:text-6xl">Lulus dengan <span className="text-gold">Ijazah</span>, <span className="text-gold">Sertifikat</span>, dan <span className="text-gold">Portofolio</span>.</h1>
      <div className="rule-gold mt-8" />
      <p className="mt-6 max-w-xl text-lg text-navy-100">Homeschooling yang memadukan pendidikan formal, keterampilan digital bersertifikat BNSP, dan karya nyata — didampingi Guru AI 24 jam.</p>
      <div className="mt-9 flex gap-3">
        <Link href="/register" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-400">Daftar sekarang</Link>
        <Link href="/portofolio" className="rounded-full border border-navy-100 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Lihat karya siswa</Link></div>
    </section></main>);
}
