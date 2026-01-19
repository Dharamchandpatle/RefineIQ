interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

const KpiCard = ({ label, value, unit }: KpiCardProps) => (
  <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm shadow-sm p-5 relative overflow-hidden dark:border-slate-700 dark:bg-slate-900/70">
    <div className="absolute top-0 left-0 h-1 w-full bg-[#F37021]/70" />
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-4 flex items-baseline gap-2">
      <span className="text-3xl font-semibold text-brand-blue dark:text-[#8DB5FF]">
        {value}
      </span>
      {unit ? <span className="text-xs text-slate-500 dark:text-slate-400">{unit}</span> : null}
    </div>
  </div>
);

export default KpiCard;
