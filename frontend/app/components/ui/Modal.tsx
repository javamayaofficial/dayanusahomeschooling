"use client";
export default function Modal({ open, onClose, title, children }:{open:boolean; onClose:()=>void; title:string; children:React.ReactNode}) {
  if (!open) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-xl2 bg-white p-6 shadow-lg" onClick={e=>e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-navy-900">{title}</h2>
        <button onClick={onClose} aria-label="Tutup" className="rounded-full px-2 text-navy-600 hover:bg-navy-50">✕</button></div>
      {children}</div></div>);
}
