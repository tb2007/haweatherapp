import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-slate-700/60 px-2 py-0.5 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </span>
  );
}

function Inner({ hours }: { hours: number }) {
  const temp = useHistoricalData(ENTITIES.temperature, hours);
  if (temp.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;

  const values = (temp.data ?? []).map(p => p.v);
  const minTemp = values.length ? Math.min(...values) : null;
  const maxTemp = values.length ? Math.max(...values) : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {minTemp != null && <StatBadge label="Low" value={`${Math.round(minTemp)}°`} color="text-sky-400" />}
        {maxTemp != null && <StatBadge label="High" value={`${Math.round(maxTemp)}°`} color="text-orange-400" />}
      </div>
      <BaseChart
        series={[{ key: 'temp', label: 'Temperature', color: '#f97316', data: temp.data ?? [] }]}
        unit="°"
        decimals={0}
      />
    </div>
  );
}

export function TemperatureChart({ hours }: { hours: number }) {
  return (
    <ChartContainer title="Temperature" hours={hours}>
      {(h) => <Inner hours={h} />}
    </ChartContainer>
  );
}
