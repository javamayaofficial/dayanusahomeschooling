import type { MediaType } from "@/types";
export default function MediaPreview({ type, url, className="" }:{type:MediaType; url:string; className?:string}) {
  if (!url) return null;
  const box = `overflow-hidden rounded-xl border border-navy-100 bg-navy-50 ${className}`;
  if (type==="image") return <div className={box}><img src={url} alt="" className="h-full w-full object-cover" /></div>;
  if (type==="video") return <div className={box}><video src={url} controls className="h-full w-full" /></div>;
  if (type==="pdf") return <div className={box}><iframe src={url} className="h-full w-full" title="PDF" /></div>;
  return <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gold-700 hover:underline">Buka tautan ↗</a>;
}
