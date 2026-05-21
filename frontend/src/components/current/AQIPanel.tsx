import { useAirQuality, aqiLabel } from '../../hooks/useAirQuality';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// AQI scale max for display purposes (300+ is hazardous)
const AQI_MAX = 300;

export function AQIPanel() {
  const { data, isLoading } = useAirQuality();

  if (isLoading) return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  if (!data) return null;

  const { label, color, bg } = aqiLabel(data.aqi);
  const markerPct = Math.min((data.aqi / AQI_MAX) * 100, 100);

  return (
    <div className={`rounded-xl border border-slate-700/50 p-4 ${bg}`}>
      <div className="flex items-start justify-between">
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

      {/* Gradient scale bar */}
      <div className="mt-4">
        <div className="relative h-2.5 rounded-full overflow-visible"
          style={{ background: 'linear-gradient(to right, #22c55e 0%, #eab308 33%, #f97316 50%, #ef4444 67%, #a855f7 83%, #f43f5e 100%)' }}>
          {/* Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-1.5 rounded-full bg-white shadow-lg ring-1 ring-slate-900"
            style={{ left: `${markerPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-slate-500 font-medium">
          <span>Good</span>
          <span>Moderate</span>
          <span>Sensitive</span>
          <span>Unhealthy</span>
          <span>Hazardous</span>
        </div>
      </div>
    </div>
  );
}
