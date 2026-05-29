import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { api } from '../../api/client';
import { ENTITIES } from '../../constants/entities';

interface DailyTotal { day: string; rain: number }

async function fetchDailyRain(): Promise<DailyTotal[]> {
  const { data } = await api.history(ENTITIES.totalRain, 168);
  if (!data?.length) return [];

  const byDay = new Map<string, { min: number; max: number }>();
  for (const pt of data) {
    const day = new Date(pt.t).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const existing = byDay.get(day);
    if (!existing) {
      byDay.set(day, { min: pt.v, max: pt.v });
    } else {
      byDay.set(day, { min: Math.min(existing.min, pt.v), max: Math.max(existing.max, pt.v) });
    }
  }

  return Array.from(byDay.entries()).map(([day, { min, max }]) => ({
    day,
    rain: Math.max(0, parseFloat((max - min).toFixed(2))),
  }));
}

function useDailyRain() {
  return useQuery({
    queryKey: ['daily-rain'],
    queryFn: fetchDailyRain,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
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

  const hasRain = rainDays && rainDays.some((d) => d.rain > 0);

  return (
    <section className="space-y-3">
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

      {/* Mini 7-day rainfall bar chart */}
      {rainDays && (
        <div className="rounded-xl bg-slate-800 px-3 pb-2 pt-3 shadow">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">7-Day Rainfall</span>
            {!hasRain && <span className="text-[10px] text-slate-600">No rain recorded</span>}
          </div>
          <div style={{ touchAction: 'pan-y' }}>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={rainDays} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                  formatter={(v: number) => [`${v.toFixed(2)} in`, 'Rain']}
                />
                <Bar dataKey="rain" fill="#38bdf8" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
