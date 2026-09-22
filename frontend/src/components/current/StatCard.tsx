import { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number | null;
  unit?: string;
  icon?: ReactNode;
  accent?: string;
  sub?: string;
}

export function StatCard({ label, value, unit, icon, accent = 'text-teal-600', sub }: Props) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${accent}`}>
        {value ?? '—'}
        {value != null && unit && (
          <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
