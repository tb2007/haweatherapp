import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';

export function RainPanel() {
  const { data } = useCurrentWeather();

  const eventVal = val(data, ENTITIES.eventRain);
  const eventUnit = unit(data, ENTITIES.eventRain);
  const rateVal = val(data, ENTITIES.rainRate);
  const rateUnit = unit(data, ENTITIES.rainRate);
  const weeklyVal = val(data, ENTITIES.weeklyRain);
  const weeklyUnit = unit(data, ENTITIES.weeklyRain);
  const yearlyVal = val(data, ENTITIES.yearlyRain);
  const yearlyUnit = unit(data, ENTITIES.yearlyRain);

  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        {/* Rain Event + Rate combined */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-800 p-4 shadow">
          <span className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">Rain Event</span>
          <div className="space-y-1">
            <div>
              <span className="text-xl font-bold text-blue-400">{eventVal ?? '—'}</span>
              {eventVal !== '—' && <span className="ml-1 text-sm text-slate-400">{eventUnit}</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400">Rate </span>
              <span className="text-sm font-bold text-blue-400">{rateVal ?? '—'}</span>
              {rateVal !== '—' && <span className="ml-1 text-xs text-slate-400">{rateUnit}</span>}
            </div>
          </div>
        </div>

        {/* Weekly + Yearly combined */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-800 p-4 shadow">
          <span className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">Weekly / Yearly</span>
          <div className="space-y-1">
            <div>
              <span className="text-xs text-slate-400">Weekly </span>
              <span className="text-xl font-bold text-blue-400">{weeklyVal ?? '—'}</span>
              {weeklyVal !== '—' && <span className="ml-1 text-sm text-slate-400">{weeklyUnit}</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400">Yearly </span>
              <span className="text-xl font-bold text-blue-400">{yearlyVal ?? '—'}</span>
              {yearlyVal !== '—' && <span className="ml-1 text-sm text-slate-400">{yearlyUnit}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
