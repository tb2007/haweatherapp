import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { StatCard } from './StatCard';

export function RainPanel() {
  const { data } = useCurrentWeather();

  const weeklyVal = val(data, ENTITIES.weeklyRain);
  const weeklyUnit = unit(data, ENTITIES.weeklyRain);
  const yearlyVal = val(data, ENTITIES.yearlyRain);
  const yearlyUnit = unit(data, ENTITIES.yearlyRain);

  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Rain Event" value={val(data, ENTITIES.eventRain)} unit={unit(data, ENTITIES.eventRain)} accent="text-blue-400" borderAccent="border-blue-400" />
        <div className="flex flex-col justify-between rounded-xl bg-slate-800 p-4 shadow border-l-4 border-blue-400">
          <span className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">Weekly / Yearly</span>
          <div className="space-y-1">
            <div>
              <span className="text-xs text-slate-400">Weekly </span>
              <span className="text-xl font-bold text-blue-400">{weeklyVal ?? '—'}</span>
              {weeklyVal != null && <span className="ml-1 text-sm text-slate-400">{weeklyUnit}</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400">Yearly </span>
              <span className="text-xl font-bold text-blue-400">{yearlyVal ?? '—'}</span>
              {yearlyVal != null && <span className="ml-1 text-sm text-slate-400">{yearlyUnit}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
