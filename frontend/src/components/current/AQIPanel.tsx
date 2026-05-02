import { useAirQuality, aqiLabel } from '../../hooks/useAirQuality';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AQIPanel() {
  const { data, isLoading } = useAirQuality();

  if (isLoading) return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  if (!data) return null;

  const { label, color, bg } = aqiLabel(data.aqi);

  return (
    <div className={`flex items-center justify-between rounded-xl border border-slate-700/50 p-4 ${bg}`}>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Air Quality Index</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-4xl font-extrabold ${color}`}>{data.aqi}</span>
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">PM2.5: <strong className="text-slate-300">{data.pm25} µg/m³</strong></p>
      </div>
      <div className="text-right text-xs text-slate-500">
        <p>Lakewood, CO</p>
        <p className="mt-0.5">via Open-Meteo</p>
      </div>
    </div>
  );
}
