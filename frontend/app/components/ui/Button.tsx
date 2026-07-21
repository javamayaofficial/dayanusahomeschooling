import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"outline"|"danger"; full?:boolean };
export default function Button({ variant="primary", full=false, className="", ...props }: Props) {
  const base=`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${full?"w-full":""}`;
  const s = variant==="primary" ? "bg-navy-900 text-white hover:bg-navy-600"
    : variant==="danger" ? "bg-red-600 text-white hover:bg-red-700"
    : "border border-navy-100 text-navy-900 hover:bg-navy-50";
  return <button className={`${base} ${s} ${className}`} {...props} />;
}
