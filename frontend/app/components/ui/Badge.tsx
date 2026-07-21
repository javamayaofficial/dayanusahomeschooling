type Tone = "navy"|"gold"|"green"|"red"|"gray";
const tones:Record<Tone,string>={navy:"bg-navy-50 text-navy-600",gold:"bg-gold-50 text-gold-700",green:"bg-emerald-50 text-emerald-700",red:"bg-red-50 text-red-700",gray:"bg-navy-50 text-navy-600"};
export default function Badge({ children, tone="navy" }:{children:React.ReactNode; tone?:Tone}) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
