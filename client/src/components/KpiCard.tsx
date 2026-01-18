interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

const KpiCard = ({ label, value, unit }: KpiCardProps) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-brand-blue">{value}</span>
      {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
    </div>
  </div>
);

export default KpiCard;
