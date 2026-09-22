import { useCurrentWeather, val, numVal, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { WindCompass } from './WindCompass';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useForecast } from '../../hooks/useForecast';
import { usePressureTrend, PressureTrend } from '../../hooks/usePressureTrend';
import { useAirQuality, aqiLabel } from '../../hooks/useAirQuality';

// WMO weather codes
function codeToCondition(code: number, isNight: boolean): { icon: string; label: string } {
  if (isNight)     return { icon: '🌙',  label: 'Night' };
  if (code === 0)  return { icon: '☀️',  label: 'Sunny' };
  if (code <= 2)   return { icon: '🌤️', label: 'Mostly Sunny' };
  if (code === 3)  return { icon: '☁️',  label: 'Cloudy' };
  if (code <= 48)  return { icon: '🌫️', label: 'Foggy' };
  if (code <= 55)  return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 65)  return { icon: '🌧️', label: 'Rain' };
  if (code <= 77)  return { icon: '🌨️', label: 'Snow' };
  if (code <= 82)  return { icon: '🌦️', label: 'Showers' };
  if (code <= 86)  return { icon: '🌨️', label: 'Snow Showers' };
  return { icon: '⛈️', label: 'Thunderstorm' };
}

function TrendBadge({ trend }: { trend: PressureTrend }) {
  if (trend === 'rising')  return <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-emerald-600">↑ Rising</span>;
  if (trend === 'falling') return <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-red-500">↓ Falling</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-white/30 px-2 py-0.5 text-xs font-medium text-white">→ Steady</span>;
}

function fmtSunTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function WeatherHero() {
  const { data, isLoading } = useCurrentWeather();
  const { data: forecast } = useForecast();
  const { data: trend } = usePressureTrend();
  const { data: aqiData } = useAirQuality();

  if (isLoading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const temp = numVal(data, ENTITIES.temperature);
  const windDeg = numVal(data, ENTITIES.windDirection);

  const currentHour = forecast?.hours?.[0];
  const feelsLike = currentHour ? Math.round(currentHour.feelsLike) : null;
  const sunTimes = forecast?.sunTimes ?? null;

  const now = Date.now();
  const isNight = sunTimes
    ? now < new Date(sunTimes.sunrise).getTime() || now > new Date(sunTimes.sunset).getTime()
    : false;
  const condition = currentHour
    ? codeToCondition(currentHour.weatherCode, isNight)
    : { icon: '🌡️', label: '' };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 p-6 text-white shadow-lg shadow-sky-200">
        {/* Condition row */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-4xl">{condition.icon}</span>
          <span className="text-sm font-medium text-white/90">{condition.label}</span>
        </div>

        {/* Temperature — large and dominant */}
        <div className="flex items-end gap-4">
          <div className="text-7xl font-extrabold leading-none text-white">
            {temp != null ? temp.toFixed(1) : '—'}
            <span className="ml-1 text-3xl font-normal text-white/70">
              {unit(data, ENTITIES.temperature)}
            </span>
          </div>
          {feelsLike != null && (
            <div className="mb-1 text-sm text-white/80">
              Feels like<br />
              <strong className="text-lg text-white">{feelsLike}°</strong>
            </div>
          )}
        </div>

        {/* Pressure + trend + AQI row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/80">
            Pressure: <strong className="text-white">{val(data, ENTITIES.pressure)} {unit(data, ENTITIES.pressure)}</strong>
          </span>
          {trend && <TrendBadge trend={trend} />}
          <span className="text-sm text-white/80">
            Humidity: <strong className="text-white">{val(data, ENTITIES.humidity)}{unit(data, ENTITIES.humidity)}</strong>
          </span>
          {aqiData && (() => {
            const { label } = aqiLabel(aqiData.aqi);
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700">
                AQI {aqiData.aqi}
                <span className="font-normal text-slate-500">{label}</span>
              </span>
            );
          })()}
        </div>

        {/* Sun times row */}
        {sunTimes && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
            <span>☀️ Rise <strong className="text-white">{fmtSunTime(sunTimes.sunrise)}</strong></span>
            <span>🌙 Set <strong className="text-white">{fmtSunTime(sunTimes.sunset)}</strong></span>
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
