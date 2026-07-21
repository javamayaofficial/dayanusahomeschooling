import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
const cls="w-full rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";
export function Input({ label, id, ...p }: InputHTMLAttributes<HTMLInputElement> & {label:string}) {
  return (<label htmlFor={id} className="block"><span className="mb-1.5 block text-sm font-medium text-navy-900">{label}</span><input id={id} className={cls} {...p} /></label>);
}
export function Textarea({ label, id, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & {label:string}) {
  return (<label htmlFor={id} className="block"><span className="mb-1.5 block text-sm font-medium text-navy-900">{label}</span><textarea id={id} className={`${cls} min-h-[90px]`} {...p} /></label>);
}
export function Select({ label, id, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & {label:string}) {
  return (<label htmlFor={id} className="block"><span className="mb-1.5 block text-sm font-medium text-navy-900">{label}</span><select id={id} className={cls} {...p}>{children}</select></label>);
}
