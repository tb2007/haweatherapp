import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { api } from '../../api/client';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface DailyTotal { day: string; rain: number }

async function fetchDailyRain(): Promise<DailyTotal[]> {
  const { data } = await api.history(ENTITIES.totalRain, 168);
  if (!data?.length) return [];

  const byDay = new Map<string, { min: number; max: number }>();
  for (const pt of data) {
    const day = new Date(pt.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

export function DailyRainChart() {
  const { data, isLoading } = useDailyRain();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Daily Rainfall (Last 7 Days)</h3>
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <div style={{ touchAction: 'pan-y' }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              unit=" in"
              tickFormatter={(v: number) => v.toFixed(2)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}
              labelStyle={{ color: '#64748b', fontSize: 11 }}
              formatter={(v: number) => [`${v.toFixed(2)} in`, 'Rain']}
            />
            <Bar dataKey="rain" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
