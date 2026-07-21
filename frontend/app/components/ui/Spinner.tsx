export default function Spinner({ label="Memuat…" }:{label?:string}) {
  return (<div className="flex items-center justify-center gap-3 py-10 text-sm text-navy-600">
    <span className="spinner inline-block h-5 w-5 rounded-full border-2 border-navy-100 border-t-gold" />{label}</div>);
}
