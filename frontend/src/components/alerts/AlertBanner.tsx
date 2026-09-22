import { useState } from 'react';
import { useNWSAlerts, NWSAlert } from '../../hooks/useNWSAlerts';

const severityStyle: Record<string, string> = {
  Extreme: 'bg-red-50 border-red-400 text-red-800',
  Severe:  'bg-orange-50 border-orange-400 text-orange-800',
  Moderate:'bg-yellow-50 border-yellow-400 text-yellow-800',
  Minor:   'bg-teal-50 border-teal-400 text-teal-800',
  Unknown: 'bg-slate-50 border-slate-300 text-slate-700',
};

function AlertItem({ alert }: { alert: NWSAlert }) {
  const [expanded, setExpanded] = useState(false);
  const style = severityStyle[alert.severity] ?? severityStyle.Unknown;

  return (
    <div className={`rounded-lg border px-4 py-3 ${style}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide opacity-75">{alert.severity}</span>
          <p className="mt-0.5 text-sm font-semibold">{alert.event}</p>
          {expanded && (
            <p className="mt-1 text-xs opacity-80">{alert.headline}</p>
          )}
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>
    </div>
  );
}

export function AlertBanner() {
  const { data: alerts } = useNWSAlerts();
  if (!alerts?.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <AlertItem key={a.id} alert={a} />
      ))}
    </div>
  );
}
