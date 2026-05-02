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

function TrendArrow({ trend }: { trend: PressureTrend }) {
  if (trend === 'rising')  return <span className="text-green-400 font-bold">↑</span>;
  if (trend === 'falling') return <span className="text-red-400 font-bold">↓</span>;
  return <span className="text-slate-400">→</span>;
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
        {/* Condition */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-4xl">{condition.icon}</span>
          <span className="text-sm font-medium text-slate-300">{condition.label}</span>
        </div>

        {/* Temperature + feels like */}
        <div className="flex items-baseline gap-3">
          <div className="text-6xl font-extrabold text-sky-300">
            {temp != null ? temp.toFixed(1) : '—'}
            <span className="ml-1 text-2xl font-normal text-slate-400">
              {unit(data, ENTITIES.temperature)}
            </span>
          </div>
          {feelsLike != null && (
            <span className="text-sm text-slate-400">
              Feels like <strong className="text-slate-200">{feelsLike}°</strong>
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>
            Pressure:{' '}
            <strong className="text-slate-200">{val(data, ENTITIES.pressure)} {unit(data, ENTITIES.pressure)}</strong>
            {trend && <span className="ml-1"><TrendArrow trend={trend} /></span>}
          </span>
          <span>Solar: <strong className="text-slate-200">{val(data, ENTITIES.solarRadiation)} W/m²</strong></span>
          <span>Lux: <strong className="text-slate-200">{val(data, ENTITIES.solarLux)}</strong></span>
        </div>

        {/* Sunrise / sunset */}
        {sunTimes && (
          <div className="mt-3 flex gap-4 text-sm text-slate-400">
            <span>🌅 <strong className="text-slate-200">{fmtSunTime(sunTimes.sunrise)}</strong></span>
            <span>🌇 <strong className="text-slate-200">{fmtSunTime(sunTimes.sunset)}</strong></span>
          </div>
        )}
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
