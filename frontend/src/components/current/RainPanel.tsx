import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { ENTITIES } from '../../constants/entities';

interface DailyTotal { label: string; rain: number }

const TUBE_H = 68; // px — inner fill area height

async function fetchDailyRain(): Promise<DailyTotal[]> {
  const { data } = await api.history(ENTITIES.totalRain, 168);
  if (!data?.length) return [];

  const today = new Date();
  const byDay = new Map<string, { min: number; max: number; ts: number }>();

  for (const pt of data) {
    const d = new Date(pt.t);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const existing = byDay.get(key);
    if (!existing) {
      byDay.set(key, { min: pt.v, max: pt.v, ts: pt.t });
    } else {
      byDay.set(key, {
        min: Math.min(existing.min, pt.v),
        max: Math.max(existing.max, pt.v),
        ts: existing.ts,
      });
    }
  }

  return Array.from(byDay.values()).map(({ min, max, ts }) => {
    const d = new Date(ts);
    const isToday = d.toDateString() === today.toDateString();
    return {
      label: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      rain: Math.max(0, parseFloat((max - min).toFixed(2))),
    };
  });
}

function useDailyRain() {
  return useQuery({
    queryKey: ['daily-rain-gauges'],
    queryFn: fetchDailyRain,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

function RainGauges({ days }: { days: DailyTotal[] }) {
  const maxRain = Math.max(...days.map((d) => d.rain), 0.01);

  return (
    <div className="flex w-full justify-between">
      {days.map((d) => {
        const fillH = Math.round((d.rain / maxRain) * TUBE_H);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1">
            {/* Amount label — fixed height so all tubes stay top-aligned */}
            <span className="flex h-3.5 items-center text-[9px] font-medium leading-none text-blue-400">
              {d.rain > 0 ? d.rain.toFixed(2) : ''}
            </span>

            {/* Gauge tube */}
            <div
              className="relative overflow-hidden rounded-full border border-slate-600 bg-slate-800/80"
              style={{ width: 22, height: TUBE_H }}
            >
              {/* Glass highlight — thin streak on left side */}
              <div className="absolute bottom-2 left-1.5 top-2 w-px rounded-full bg-white/10" />

              {/* Graduation marks at 25 / 50 / 75 % */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-0 right-0 border-t border-slate-600/60"
                  style={{ bottom: Math.round(pct * TUBE_H) }}
                />
              ))}

              {/* Water fill */}
              {fillH > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-700 to-sky-400"
                  style={{ height: fillH }}
                />
              )}
            </div>

            {/* Day label */}
            <span className="text-[10px] leading-none text-slate-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RainPanel() {
  const { data } = useCurrentWeather();
  const { data: rainDays } = useDailyRain();

  const eventVal = val(data, ENTITIES.eventRain);
  const eventUnit = unit(data, ENTITIES.eventRain);
  const rateVal = val(data, ENTITIES.rainRate);
  const rateUnit = unit(data, ENTITIES.rainRate);
  const weeklyVal = val(data, ENTITIES.weeklyRain);
  const weeklyUnit = unit(data, ENTITIES.weeklyRain);
  const yearlyVal = val(data, ENTITIES.yearlyRain);
  const yearlyUnit = unit(data, ENTITIES.yearlyRain);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Rain Event + Rate combined */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-700 p-4 shadow">
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
        <div className="flex flex-col justify-between rounded-xl bg-slate-700 p-4 shadow">
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

      {/* 7-day rain gauges */}
      {rainDays && (
        <div className="rounded-xl bg-slate-700 px-4 pb-3 pt-3 shadow">
          <span className="mb-3 block text-[10px] font-medium uppercase tracking-widest text-slate-500">
            7-Day Rainfall
          </span>
          <RainGauges days={rainDays} />
        </div>
      )}
    </section>
  );
}
