export default function ProgressBar({ percent }:{percent:number}) {
  return (<div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-100"><div className="h-full rounded-full bg-gold transition-all" style={{width:`${Math.min(100,percent)}%`}} /></div>);
}
