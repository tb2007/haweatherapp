const OPTIONS = [
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '7d', hours: 168 },
];

export function TimeRangePicker({
  hours,
  onChange,
}: {
  hours: number;
  onChange: (h: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.hours}
          onClick={() => onChange(o.hours)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            hours === o.hours
              ? 'bg-sky-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
