import { useCurrentWeather, val, numVal, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { WindCompass } from './WindCompass';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useForecast } from '../../hooks/useForecast';
import { usePressureTrend, PressureTrend } from '../../hooks/usePressureTrend';

function weatherCondition(solar: number | null, lux: number | null): { icon: string; label: string } {
  if (lux == null || lux < 10)  return { icon: '🌙', label: 'Night' };
  if (solar == null)             return { icon: '🌤️', label: 'Partly Cloudy' };
  if (solar > 700)               return { icon: '☀️', label: 'Sunny' };
  if (solar > 300)               return { icon: '🌤️', label: 'Mostly Sunny' };
  if (solar > 100)               return { icon: '⛅', label: 'Partly Cloudy' };
  if (solar > 20)                return { icon: '☁️', label: 'Cloudy' };
  return                          { icon: '🌫️', label: 'Overcast' };
}

function TrendBadge({ trend }: { trend: PressureTrend }) {
  if (trend === 'rising')  return <span className="inline-flex items-center gap-1 rounded-full bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-400">↑ Rising</span>;
  if (trend === 'falling') return <span className="inline-flex items-center gap-1 rounded-full bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-400">↓ Falling</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-400">→ Steady</span>;
}

function fmtSunTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function WeatherHero() {
  const { data, isLoading } = useCurrentWeather();
  const { data: forecast } = useForecast();
  const { data: trend } = usePressureTrend();

  if (isLoading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const temp = numVal(data, ENTITIES.temperature);
  const windDeg = numVal(data, ENTITIES.windDirection);
  const solar = numVal(data, ENTITIES.solarRadiation);
  const lux = numVal(data, ENTITIES.solarLux);
  const condition = weatherCondition(solar, lux);

  const currentHour = forecast?.hours?.[0];
  const feelsLike = currentHour ? Math.round(currentHour.feelsLike) : null;
  const sunTimes = forecast?.sunTimes ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-sky-900/60 to-slate-800 p-6 shadow-lg">
        {/* Condition row */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-4xl">{condition.icon}</span>
          <span className="text-sm font-medium text-slate-300">{condition.label}</span>
        </div>

        {/* Temperature — large and dominant */}
        <div className="flex items-end gap-4">
          <div className="text-7xl font-extrabold leading-none text-sky-300">
            {temp != null ? temp.toFixed(1) : '—'}
            <span className="ml-1 text-3xl font-normal text-slate-400">
              {unit(data, ENTITIES.temperature)}
            </span>
          </div>
          {feelsLike != null && (
            <div className="mb-1 text-sm text-slate-400">
              Feels like<br />
              <strong className="text-lg text-slate-200">{feelsLike}°</strong>
            </div>
          )}
        </div>

        {/* Pressure + trend badge */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">
            Pressure: <strong className="text-slate-200">{val(data, ENTITIES.pressure)} {unit(data, ENTITIES.pressure)}</strong>
          </span>
          {trend && <TrendBadge trend={trend} />}
        </div>

        {/* Solar + sun times row */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Solar: <strong className="text-slate-200">{val(data, ENTITIES.solarRadiation)} W/m²</strong></span>
          <span>Lux: <strong className="text-slate-200">{val(data, ENTITIES.solarLux)}</strong></span>
          {sunTimes && (
            <>
              <span>🌅 <strong className="text-slate-200">{fmtSunTime(sunTimes.sunrise)}</strong></span>
              <span>🌇 <strong className="text-slate-200">{fmtSunTime(sunTimes.sunset)}</strong></span>
            </>
          )}
        </div>
      </div>

      <WindCompass
        degrees={windDeg}
        speed={val(data, ENTITIES.windSpeed)}
        gust={val(data, ENTITIES.windGust)}
        unit={unit(data, ENTITIES.windSpeed)}
      />
    </div>
  );
}
