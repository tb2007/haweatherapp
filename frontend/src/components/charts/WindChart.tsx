import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { HistoryPoint } from '../../api/client';

function rollingAverage(data: HistoryPoint[], window: number): HistoryPoint[] {
  return data.map((pt, i) => {
    const start = Math.max(0, i - Math.floor(window / 2));
    const slice = data.slice(start, start + window);
    const avg = slice.reduce((sum, p) => sum + p.v, 0) / slice.length;
    return { t: pt.t, v: avg };
  });
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-slate-700/60 px-2 py-0.5 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </span>
  );
}

function Inner({ hours }: { hours: number }) {
  const speed = useHistoricalData(ENTITIES.windSpeed, hours);
  const gust = useHistoricalData(ENTITIES.windGust, hours);
  if (speed.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;

  const speedData = speed.data ?? [];
  const gustData = gust.data ?? [];
  const maxSpeed = speedData.length ? Math.max(...speedData.map(p => p.v)) : null;
  const maxGust = gustData.length ? Math.max(...gustData.map(p => p.v)) : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {maxSpeed != null && <StatBadge label="Max Wind" value={`${Math.round(maxSpeed)} mph`} color="text-emerald-400" />}
        {maxGust != null && <StatBadge label="Max Gust" value={`${Math.round(maxGust)} mph`} color="text-yellow-400" />}
      </div>
      <BaseChart
        series={[
          { key: 'speed', label: 'Wind Speed', color: '#34d399', data: rollingAverage(speedData, 10) },
          { key: 'gust', label: 'Gust', color: '#fbbf24', data: rollingAverage(gustData, 10) },
        ]}
        unit="mph"
        yDomain={[0, 'auto']}
        yAxisWidth={60}
        decimals={0}
      />
    </div>
  );
}

export function WindChart({ hours }: { hours: number }) {
  return (
    <ChartContainer title="Wind Speed & Gust" hours={hours}>
      {(h) => <Inner hours={h} />}
    </ChartContainer>
  );
}
