import { useCurrentWeather, val, numVal, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';

const ZONES = [
  { label: 'Zone 1', id: ENTITIES.soilMoisture1 },
  { label: 'Zone 3', id: ENTITIES.soilMoisture3 },
  { label: 'Zone 4', id: ENTITIES.soilMoisture4 },
  { label: 'Zone 5', id: ENTITIES.soilMoisture5 },
  { label: 'Zone 6', id: ENTITIES.soilMoisture6 },
];

function moistureColor(pct: number | null) {
  if (pct == null) return 'bg-slate-600';
  if (pct < 20) return 'bg-red-500';
  if (pct < 40) return 'bg-yellow-500';
  if (pct < 70) return 'bg-green-500';
  return 'bg-blue-500';
}

export function SoilPanel() {
  const { data } = useCurrentWeather();

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Soil Moisture
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ZONES.map(({ label, id }) => {
          const pct = numVal(data, id);
          const display = val(data, id);
          const u = unit(data, id);
          return (
            <div key={id} className="rounded-xl bg-slate-800 p-4 shadow">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</span>
                <span className="text-lg font-bold text-emerald-400">
                  {display}{u && <span className="ml-0.5 text-sm font-normal text-slate-400">{u}</span>}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all ${moistureColor(pct)}`}
                  style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
